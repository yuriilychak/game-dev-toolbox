export function generateUUID() {
  let d: number = new Date().getTime(); //Timestamp
  let d2: number =
    (typeof performance !== "undefined" &&
      performance.now &&
      performance.now() * 1000) ||
    0; //Time in microseconds since page-load or 0 if unsupported

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    (c: string) => {
      let r: number = Math.random() * 16; //random number between 0 and 16

      if (d > 0) {
        //Use timestamp until depleted
        r = (d + r) % 16 | 0;
        d = (d / 16) | 0;
      } else {
        //Use microseconds since page-load if supported
        r = (d2 + r) % 16 | 0;
        d2 = (d2 / 16) | 0;
      }

      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    },
  );
}

export function formatSize(bytes: number): string {
  const units: string[] = ["b", "kb", "mb", "gb"];
  const kbShift: number = 10;
  const maxUnitIndex: number = units.length - 1;
  const kbValue: number = 1 << kbShift;
  let unitIndex: number = 0;
  let currentBytes: number = bytes;

  while (currentBytes >= kbValue && unitIndex < maxUnitIndex) {
    currentBytes = currentBytes >> kbShift;
    ++unitIndex;
  }

  return `${(bytes / (1 << (unitIndex * kbShift))).toFixed(2)}${units[unitIndex]}`;
}
