let musicLibDir = undefined;

const root = await (navigator.storage as any).getDirectory();

export const loadMusic = async () => {
  try {
    const directoryHandleOrUndefined = root;
    console.log('directoryHandleOrUndefined', directoryHandleOrUndefined);
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
    console.log(musicLibDir);

    await addMusicToLib(dirHandle);
    return dirHandle;
  }
  else if (type === "file") {
    const fileHandle = await (window as any).showOpenFilePicker();
    console.log(fileHandle);
    await addMusicToLib(fileHandle);
    return fileHandle;
  }
  else {
    console.log('handle');
  }
}

export async function removeFromLib(handle: any) {
  console.log('handle', handle);
  await root.removeEntry(handle.name, { recursive: true });
}

export async function addMusicToLib(dirHandle: any) {
  for await (const entry of dirHandle.values()) {
    console.log('entry', entry);

    if (entry.kind === 'file') {
      const newFileHandle = await root.getFileHandle(entry.name, {
        create: true,
      });

      const writable = await newFileHandle.createWritable();
      // Write the contents of the file to the stream.
      await writable.write(await entry.getFile());
      // Close the file and write the contents to disk.
      await writable.close();
    } else if (entry.kind === 'directory') {
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
  }
}
