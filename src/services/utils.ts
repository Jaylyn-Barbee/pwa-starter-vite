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

export function setMedia(currentEntry: any | undefined){
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
