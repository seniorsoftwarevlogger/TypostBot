import Typograf from "typograf";
import { fmt, FmtString, link } from "telegraf/format";

const typografInstance = new Typograf({ locale: ["ru", "en-US"] });

export function formatPost(text, entities, footer, typograf, instantView) {
  const formattedFooter = fmt`\n\n${link(
    "Поддержать 🫶",
    "https://seniorsoftwarevlogger.com/support"
  )} | ${link(
    "YouTube",
    "https://youtube.com/@SeniorSoftwareVlogger"
  )} | ${link("Twitter", "https://twitter.com/softwarevlogger")}\n`;

  const formattedPost = fmt`${new FmtString(
    typograf ? typografInstance.execute(text) : text,
    entities
  )} ${
    footer ? new FmtString(formattedFooter.text, formattedFooter.entities) : ""
  }`;

  return [formattedPost.text, formattedPost.entities];
}
