import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";

export default function useDialoger() {
  const [dialogeds, setDialogeds] = useState([]);

  function dialoger(component) {
    return (
      <>
        {component}
        {dialogeds.map((item, i) => {
          const { build, dialogProps, openResolve } = item;

          return (
            <Dialog key={i} {...(dialogProps || {})} open={true}>
              {build((value) => {
                try {
                  dialogeds.splice(dialogeds.indexOf(item), 1);
                  setDialogeds([...dialogeds]);
                } finally {
                  openResolve(value);
                }
              })}
            </Dialog>
          );
        })}
      </>
    );
  }

  dialoger.open = async (build, dialogProps = {}) => {
    return await new Promise((resolve, reject) => {
      const dialoged = {
        build: build,
        dialogProps: dialogProps,
        openResolve: resolve,
      };

      dialogeds.push(dialoged);
      setDialogeds([...dialogeds]);
    });
  };

  dialoger.alert = async (message) => {
    return await dialoger.open((close) => {
      return (
        <>
          {/* <DialogTitle>Alert</DialogTitle> */}
          <DialogContent>
            <DialogContentText>{message}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              onClick={() => {
                close();
              }}
              autoFocus
            >
              ok
            </Button>
          </DialogActions>
        </>
      );
    });
  };

  dialoger.confirm = async (message) => {
    return await dialoger.open((close) => {
      return (
        <>
          {/* <DialogTitle>Alert</DialogTitle> */}
          <DialogContent>
            <DialogContentText>{message}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={() => {
                close(false);
              }}
            >
              cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                close(true);
              }}
              autoFocus
            >
              confirm
            </Button>
          </DialogActions>
        </>
      );
    });
  };

  dialoger.prompt = async (message, defaultInput = "") => {
    return await dialoger.open((close) => {
      function Prompt() {
        const promptInputRef = useRef(undefined);

        useEffect(() => {
          promptInputRef.current.value = defaultInput;
        }, []);

        return (
          <form
            style={{
              display: "flex",
            }}
          >
            {/* <DialogTitle>Alert</DialogTitle> */}
            <DialogContent>
              <DialogContentText>{message}</DialogContentText>
            </DialogContent>
            <TextField
              inputRef={promptInputRef}
              autoFocus
              required
              autoComplete="none"
              fullWidth
              variant="outlined"
              onKeyDown={(ev) => {
                if (ev.key == "Enter") {
                  ev.preventDefault();
                  doSubmit();
                }
              }}
            />
            <DialogActions>
              <Button
                variant="outlined"
                onClick={(ev) => {
                  ev.preventDefault();
                  close(null);
                }}
              >
                cancel
              </Button>
              <Button
                variant="contained"
                onClick={(ev) => {
                  ev.preventDefault();
                  close(promptInputRef.current.value);
                }}
              >
                submit
              </Button>
            </DialogActions>
          </form>
        );
      }

      return <Prompt />;
    });
  };

  dialoger.load = async (
    promise,
    message = null,
    cancellableThrowable = undefined
  ) => {
    const dialogResult = await dialoger.open((close) => {
      function Load() {
        useEffect(() => {
          (async function () {
            let result = null;
            try {
              result = await promise;
            } catch (e) {
              close([false, e]);
              return;
            }
            close([true, result]);
          })();
        }, [promise]);

        return (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "10px",
              gap: "12px",
            }}
          >
            <CircularProgress
              style={{
                marginTop: "5px",
              }}
            />
            {message != null ? (
              <Typography
                style={{
                  fontSize: "15px",
                  // fontWeight: "bold",
                  maxWidth: "100%",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {message}
              </Typography>
            ) : null}
            {cancellableThrowable !== undefined ? (
              <Button
                variant="outlined"
                onClick={() => {
                  close([false, cancellableThrowable]);
                }}
              >
                cancel
              </Button>
            ) : null}
          </div>
        );
      }

      return <Load />;
    });

    const [ok, data] = dialogResult;

    if (ok == true) {
      return data;
    }

    throw data;
  };

  return dialoger;
}
