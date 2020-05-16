import page from "page";
import { setState } from "./state";

page("/", () => {
  console.log("page /");
  setState({ room: undefined });
});

page("/:room", (ctx) => {
  console.log("page /:room");
  setState({ room: ctx.params.room.toUpperCase() });
});

page.start();
