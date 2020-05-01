import page from "page";
import { setState } from "./state";

page("/", () => {
  setState({ room: undefined });
});

page("/:room", (ctx) => {
  setState({ room: ctx.params.room });
});

page.start();
