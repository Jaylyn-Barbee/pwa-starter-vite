import { directoryOpen, fileOpen } from "browser-fs-access";

let musicLibDir = undefined;

export const loadMusic = async () => {
  try {
    if (navigator.storage && "getDirectory" in navigator.storage) {
      const root = await navigator.storage.getDirectory();
      const directoryHandleOrUndefined = root;

      if (directoryHandleOrUndefined) {
        musicLibDir = directoryHandleOrUndefined;
        return musicLibDir;
      }
    }
    else {
      const root = await directoryOpen({
        recursive: false,
        startIn: "music"
      });

      const directoryHandleOrUndefined = root;

      if (directoryHandleOrUndefined) {
        musicLibDir = directoryHandleOrUndefined;
        return musicLibDir;
      }
    }
  } catch (error: any) {
    console.error(error);
  }
};

export async function addNewMusic(type: "file" | "directory") {
  if (type === "directory") {
    /*const dirHandle = await (window as any).showDirectoryPicker();
    musicLibDir = dirHandle;
    console.log("musicLibDir", musicLibDir);

    await addMusicToLib(dirHandle, type);
    return dirHandle;*/
    const dirHandle = await directoryOpen({
      recursive: false,
      startIn: "music"
    });

    console.log(dirHandle)

    const handleObject = {
      kind: "directory",
      name: dirHandle[0]?.directoryHandle?.name || ""
    }

    await addMusicToLib(dirHandle[0].directoryHandle || handleObject, type);
    return dirHandle[0].directoryHandle || handleObject;
  }
  else {
    /*const fileHandle = await (window as any).showOpenFilePicker();
    console.log("fileHandle", fileHandle);
    await addMusicToLib(fileHandle, type);
    return fileHandle;*/

    /*const fileHandle1 = await (window as any).showOpenFilePicker();
    console.log("fileHandle1", fileHandle1);*/

    const fileHandle = await fileOpen({
      mimeTypes: ["audio/*"],
    });

    const handleObject = {
      kind: "file",
      name: fileHandle.name,
    }

    await addMusicToLib(fileHandle.handle || handleObject, type);
    return fileHandle.handle || handleObject;
  }
}

export async function removeFromLib(handle: any, rootDir?: any): Promise<void> {
  return new Promise(async (resolve) => {
    if (rootDir) {
      console.log("rootDir", rootDir);
      await rootDir.removeEntry(handle.name, { recursive: true});

      const root = await (navigator.storage as any).getDirectory();
      const newDirHandle = await root.getDirectoryHandle(rootDir.name, {
        create: true,
      });

      console.log("newDirHandle", newDirHandle);

      if (newDirHandle) {
        for await (const newEntry of rootDir.values()) {
          if (newEntry.kind === 'file') {
            const newFileHandle = await newDirHandle.getFileHandle(
              newEntry.name,
              { create: true }
            );

            const writable = await newFileHandle.createWritable();
            // Write the contents of the file to the stream.
            await writable.write(await newEntry.getFile());
            // Close the file and write the contents to disk.
            await writable.close();
          }
        }

        resolve();
      }
    }
    else {
      const root = await (navigator.storage as any).getDirectory();
      await root.removeEntry(handle.name, { recursive: true });

      resolve();
    }
  });
}

export async function addMusicToLib(handle: any, type: "file" | "directory") {
  console.log('addMusicTolib', handle.kind);
  /*for await (const entry of dirHandle.values()) {
    console.log('entry', entry);

    if (entry.kind === 'file') {
      const root = await (navigator.storage as any).getDirectory();
      const newFileHandle = await root.getFileHandle(entry.name, {
        create: true,
      });

      const writable = await newFileHandle.createWritable();
      // Write the contents of the file to the stream.
      await writable.write(await entry.getFile());
      // Close the file and write the contents to disk.
      await writable.close();
    } else if (entry.kind === 'directory') {
      const root = await (navigator.storage as any).getDirectory();
      const newDirHandle = await root.getDirectoryHandle(entry.name, {
        create: true,
      });

      for await (const newEntry of entry.values()) {
        if (newEntry.kind === 'file') {
          const newFileHandle = await newDirHandle.getFileHandle(
            newEntry.name,
            { create: true }
          );

          const writable = await newFileHandle.createWritable();
          // Write the contents of the file to the stream.
          await writable.write(await newEntry.getFile());
          // Close the file and write the contents to disk.
          await writable.close();
        }
      }
    }
  }*/

  if (type === "file") {
    console.log('adding file', handle);
    const root = await (navigator.storage as any).getDirectory();
    const newFileHandle = await root.getFileHandle(handle.name, {
      create: true,
    });

    const writable = await newFileHandle.createWritable();
    // Write the contents of the file to the stream.
    await writable.write(await handle.getFile());
    // Close the file and write the contents to disk.
    await writable.close();
  }
  else if (type === "directory") {
    console.log('adding directory');
    const root = await (navigator.storage as any).getDirectory();

    for await (const newEntry of handle.values()) {
      if (newEntry.kind === 'file') {
        const newFileHandle = await root.getFileHandle(
          newEntry.name,
          { create: true }
        );

        const writable = await newFileHandle.createWritable();
        // Write the contents of the file to the stream.
        await writable.write(await newEntry.getFile());
        // Close the file and write the contents to disk.
        await writable.close();
      }
    }
  }
}
