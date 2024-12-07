import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  CircularProgress,
  TextField,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";

export default function MuiDialogerProvider({ children, dialogerRef }) {
  const [dialogeds, setDialogeds] = useState([]);

  useEffect(() => {
    if (dialogerRef == null) {
      return;
    }

    const originalValue = dialogerRef.current; //most likely to be undefined

    dialogerRef.current = {
      open: async (component, payload, muiDialogProps) => {
        return new Promise((resolve, reject) => {
          const dialoged = {
            muiDialogProps: muiDialogProps,
            element: React.createElement(component, {
              close: (result) => {
                dialogeds.splice(dialogeds.indexOf(dialoged), 1);
                setDialogeds([...dialogeds]);

                resolve(result);
              },
              payload,
            }),
          };

          dialogeds.push(dialoged);
          setDialogeds([...dialogeds]);
        });
      },

      alert: async function (message) {
        return new Promise((resolve, reject) => {
          const dialoged = {
            muiDialogProps: {},
            element: (
              <>
                {/* <DialogTitle>Alert</DialogTitle> */}
                <DialogContent>
                  <DialogContentText>{message}</DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={() => {
                      dialogeds.splice(dialogeds.indexOf(dialoged), 1);
                      setDialogeds([...dialogeds]);

                      resolve();
                    }}
                    autoFocus
                  >
                    ok
                  </Button>
                </DialogActions>
              </>
            ),
          };

          dialogeds.push(dialoged);
          setDialogeds([...dialogeds]);
        });
      },

      confirm: async function (message) {
        return new Promise((resolve, reject) => {
          const dialoged = {
            muiDialogProps: {},
            element: (
              <>
                {/* <DialogTitle>Alert</DialogTitle> */}
                <DialogContent>
                  <DialogContentText>{message}</DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={() => {
                      dialogeds.splice(dialogeds.indexOf(dialoged), 1);
                      setDialogeds([...dialogeds]);

                      resolve(false);
                    }}
                    autoFocus
                  >
                    cancel
                  </Button>
                  <Button
                    onClick={() => {
                      dialogeds.splice(dialogeds.indexOf(dialoged), 1);
                      setDialogeds([...dialogeds]);

                      resolve(true);
                    }}
                    autoFocus
                  >
                    confirm
                  </Button>
                </DialogActions>
              </>
            ),
          };

          dialogeds.push(dialoged);
          setDialogeds([...dialogeds]);
        });
      },

      load: async function (promise, message, cancellableThrowable) {
        function Load({ close }) {
          useState(() => {
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
          }, []);

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

        return new Promise((resolve, reject) => {
          const dialoged = {
            muiDialogProps: {},
            element: (
              <Load
                close={(result) => {
                  dialogeds.splice(dialogeds.indexOf(dialoged), 1);
                  setDialogeds([...dialogeds]);

                  resolve(result);
                }}
              />
            ),
          };

          dialogeds.push(dialoged);
          setDialogeds([...dialogeds]);
        });
      },

      prompt: async function (message, defaultInput) {
        function Prompt({ close }) {
          const promptInputRef = useRef(undefined);

          useState(() => {
            promptInputRef.current.value = defaultInput;
          }, []);

          async function doSubmit() {
            close(promptInputRef.current.value);
          }

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
                  onClick={(ev) => {
                    ev.preventDefault();
                    doSubmit();
                  }}
                  autoFocus
                >
                  submit
                </Button>
              </DialogActions>
            </form>
          );
        }

        return new Promise((resolve, reject) => {
          const dialoged = {
            muiDialogProps: {},
            element: (
              <Prompt
                close={(result) => {
                  dialogeds.splice(dialogeds.indexOf(dialoged), 1);
                  setDialogeds([...dialogeds]);

                  resolve(result);
                }}
              />
            ),
          };

          dialogeds.push(dialoged);
          setDialogeds([...dialogeds]);
        });
      },
    };

    return () => {
      dialogerRef.current = originalValue;
    };
  }, []);

  return (
    <>
      {children}
      {dialogeds.map((item, i) => {
        const { muiDialogProps, element } = item;

        return (
          <Dialog key={item} {...(muiDialogProps || {})} open={true}>
            {element}
          </Dialog>
        );
      })}
    </>
  );
}
