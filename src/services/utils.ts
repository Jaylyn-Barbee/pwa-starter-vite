export async function shareSong(currentEntry: any | undefined): Promise<void> {
  let filesArray: any[] = [];

  if (currentEntry) {
    console.log(currentEntry);
    filesArray.push(currentEntry);
  }

  if (navigator.canShare && navigator.canShare({ files: filesArray })) {
    try {
      await navigator.share({
        files: filesArray,
        title: 'Music',
        text: 'music',
      });
    } catch (err) {
      console.error(err);
    }
  } else {
    console.log(`Your system doesn't support sharing files.`);
  }
}

export function setMedia(currentEntry: any | undefined) {
  console.log('setting media');
  navigator.mediaSession.metadata = new MediaMetadata({
    title: currentEntry.name,
    artist: 'Not Available',
    album: 'Not Available',
    artwork: [
      {
        src: 'https://via.placeholder.com/96',
        sizes: '96x96',
        type: 'image/png',
      },
      {
        src: 'https://via.placeholder.com/128',
        sizes: '128x128',
        type: 'image/png',
      },
      {
        src: 'https://via.placeholder.com/192',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'https://via.placeholder.com/256',
        sizes: '256x256',
        type: 'image/png',
      },
      {
        src: 'https://via.placeholder.com/384',
        sizes: '384x384',
        type: 'image/png',
      },
      {
        src: 'https://via.placeholder.com/512',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  });
}

export async function findSong(
  music: Array<any>,
  currentEntry: any | undefined,
  dir: 'next' | 'previous'
) {
  return new Promise((resolve) => {
    let index = 0;

    if (music && music.length > 0) {
      console.log('currentEntry', currentEntry);
      console.log('music', music);

      music.forEach((entry) => {
        console.log('entry', entry.entry.kind);
        console.log('entry.folderSongs', entry.folderSongs);

        if (entry.folderSongs) {
          let potentialIndex = entry.folderSongs.findIndex(
            (file: any) => file.name === currentEntry.name
          );

          console.log(potentialIndex);

          if (potentialIndex > -1) {
            index = potentialIndex;

            const nextIndex = dir === 'previous' ? index - 1 : index + 1;

            console.log('nextIndex', nextIndex);

            if (music && nextIndex < entry.folderSongs.length) {
              console.log(
                'entry.folderSongs[nextIndex]',
                entry.folderSongs[nextIndex]
              );

              resolve(entry.folderSongs[nextIndex]);
              // this.loadSong(entry.folderSongs[nextIndex]);
            }
          }
        } else {
          console.log('music 2', music);
          console.log('file', currentEntry.name);
          let potentialIndex = music?.findIndex(
            (file: any) => file.file?.name === currentEntry.name
          );

          console.log('potentialIndex', potentialIndex);

          if (potentialIndex !== undefined && potentialIndex > -1) {
            index = potentialIndex;

            const nextIndex = dir === 'previous' ? index - 1 : index + 1;

            console.log('music inside file', music);

            if (music && nextIndex < music.length) {
              console.log('music[nextIndex]', music[nextIndex].entry);
              const found = music[nextIndex].entry;

              console.log('found', found);

              resolve(found);
            }
          }
        }
      });
    }
  });
}

// change theme color
export function changeThemeColor(color: string) {
  if (color && color !== '#ffffff') {
    console.log('changing theme color', color);
      // change --sl-color-primary-500 and --sl-color-primary-600 css variables to color
      document.documentElement.style.setProperty('--sl-color-primary-500', color);
      document.documentElement.style.setProperty('--sl-color-primary-600', color);

      // save new color to local storage
      localStorage.setItem('themePrimaryColor', color);
  }
}
