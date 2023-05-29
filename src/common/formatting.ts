import { CommonConstants } from "@/common/enums";
import { default as env } from "@/common/env";

export function formatDate(date: Date, onlyHoursMinutes?: boolean): string {
  if (onlyHoursMinutes == true) {
    return (
      ("0" + date.getHours()).slice(-2) +
      ":" +
      ("0" + date.getMinutes()).slice(-2) +
      (env().NODE_ENV == CommonConstants.PROD_ENV ? " UTC" : "")
    );
  } else {
    return (
      ("0" + date.getDate()).slice(-2) +
      "." +
      ("0" + (date.getMonth() + 1)).slice(-2) +
      "." +
      date.getFullYear() +
      ". " +
      ("0" + date.getHours()).slice(-2) +
      ":" +
      ("0" + date.getMinutes()).slice(-2) +
      ":" +
      ("0" + date.getSeconds()).slice(-2) +
      (env().NODE_ENV == CommonConstants.PROD_ENV ? " UTC" : "")
    );
  }
}

export function millisToMinutesAndSeconds(millis: number): string {
  const minutes = Math.floor(millis / 60000);
  const seconds = parseInt(((millis % 60000) / 1000).toFixed(0), 10);
  return seconds == 60
    ? minutes + 1 + "m00s"
    : minutes + "m" + (seconds < 10 ? "0" : "") + seconds + "s";
}

export function millisToSeconds(millis: number): string {
  return `${parseInt((millis / 1000).toFixed(0), 10).toFixed(0)}s`;
}
