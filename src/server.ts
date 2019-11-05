import app from "./app";
import {PORT, ENV} from "./util/secrets";

const server = app.listen(PORT || 3000, () => {
    console.log(
        "  App is running at http://localhost:%d in %s mode",
        PORT || 3000,
        ENV
    );
    console.log("  Press CTRL-C to stop\n");
});

export default server;
