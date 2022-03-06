let musicLibDir = undefined;

// const root = await (navigator.storage as any).getDirectory();

export const loadMusic = async () => {
  try {
    const root = await (navigator.storage as any).getDirectory();
    const directoryHandleOrUndefined = root;

    if (directoryHandleOrUndefined) {
      musicLibDir = directoryHandleOrUndefined;
      return musicLibDir;
    }
  } catch (error: any) {
    console.error(error);
  }
};

export async function addNewMusic(type: "file" | "directory") {
  if (type === "directory") {
    const dirHandle = await (window as any).showDirectoryPicker();
    musicLibDir = dirHandle;
    console.log("musicLibDir", musicLibDir);

    await addMusicToLib(dirHandle, type);
    return dirHandle;
  }
  else if (type === "file") {
    const fileHandle = await (window as any).showOpenFilePicker();
    console.log("fileHandle", fileHandle);
    await addMusicToLib(fileHandle, type);
    return fileHandle;
  }
  else {
    console.log('handle');
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
    const newFileHandle = await root.getFileHandle(handle[0].name, {
      create: true,
    });

    const writable = await newFileHandle.createWritable();
    // Write the contents of the file to the stream.
    await writable.write(await handle[0].getFile());
    // Close the file and write the contents to disk.
    await writable.close();
  }
  else if (type === "directory") {
    console.log('adding directory');
    const root = await (navigator.storage as any).getDirectory();
    const newDirHandle = await root.getDirectoryHandle(handle.name, {
      create: true,
    });

    for await (const newEntry of handle.values()) {
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
}
