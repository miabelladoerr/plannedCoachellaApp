export function artistKey(weekend, day, stage, artist) {
  return `w${weekend}|${day}|${stage}|${artist.name}|${artist.startTime}`;
}
