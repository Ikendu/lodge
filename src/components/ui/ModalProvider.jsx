import React, { createContext, useCallback, useContext, useState } from "react";

const ModalContext = createContext(null);

export function useModalContext() {
  return useContext(ModalContext);
}

function ModalShell({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-[95%] max-w-lg shadow-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="px-4 py-3 border-b">
          <div className="text-lg font-semibold text-gray-800">{title}</div>
        </div>
        <div className="p-4 text-sm text-gray-700">{children}</div>
        {footer && (
          <div className="px-4 py-3 border-t bg-gray-50">{footer}</div>
        )}
      </div>
    </div>
  );
}

export function ModalProvider({ children }) {
  const [modal, setModal] = useState(null);

  const close = useCallback(() => setModal(null), []);

  const alert = useCallback(
    ({ title = "", message = "", okText = "OK" }) => {
      return new Promise((resolve) => {
        setModal({
          type: "alert",
          title,
          message,
          okText,
          onOk: () => {
            close();
            resolve(true);
          },
        });
      });
    },
    [close]
  );

  const confirm = useCallback(
    ({ title = "", message = "", okText = "OK", cancelText = "Cancel" }) => {
      return new Promise((resolve) => {
        setModal({
          type: "confirm",
          title,
          message,
          okText,
          cancelText,
          onOk: () => {
            close();
            resolve(true);
          },
          onCancel: () => {
            close();
            resolve(false);
          },
        });
      });
    },
    [close]
  );

  const prompt = useCallback(
    ({
      title = "",
      message = "",
      placeholder = "",
      okText = "OK",
      cancelText = "Cancel",
      defaultValue = "",
    }) => {
      return new Promise((resolve) => {
        let value = defaultValue || "";
        setModal({
          type: "prompt",
          title,
          message,
          placeholder,
          okText,
          cancelText,
          defaultValue,
          onOk: () => {
            close();
            resolve(value);
          },
          onCancel: () => {
            close();
            resolve(null);
          },
          onChange: (v) => {
            value = v;
          },
        });
      });
    },
    [close]
  );

  const ctx = { alert, confirm, prompt };

  return (
    <ModalContext.Provider value={ctx}>
      {children}
      {modal && modal.type === "alert" && (
        <ModalShell
          open
          onClose={() => {
            modal.onOk();
          }}
          title={modal.title || ""}
          footer={
            <div className="flex justify-end">
              <button
                onClick={modal.onOk}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                {modal.okText || "OK"}
              </button>
            </div>
          }
        >
          <div dangerouslySetInnerHTML={{ __html: modal.message || "" }} />
        </ModalShell>
      )}

      {modal && modal.type === "confirm" && (
        <ModalShell
          open
          onClose={() => modal.onCancel && modal.onCancel()}
          title={modal.title || ""}
          footer={
            <div className="flex justify-end space-x-2">
              <button
                onClick={modal.onCancel}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                {modal.cancelText || "Cancel"}
              </button>
              <button
                onClick={modal.onOk}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                {modal.okText || "OK"}
              </button>
            </div>
          }
        >
          <div dangerouslySetInnerHTML={{ __html: modal.message || "" }} />
        </ModalShell>
      )}

      {modal && modal.type === "prompt" && (
        <ModalShell
          open
          onClose={() => modal.onCancel && modal.onCancel()}
          title={modal.title || ""}
          footer={
            <div className="flex justify-end space-x-2">
              <button
                onClick={modal.onCancel}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                {modal.cancelText || "Cancel"}
              </button>
              <button
                onClick={() => modal.onOk && modal.onOk()}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                {modal.okText || "OK"}
              </button>
            </div>
          }
        >
          <div
            className="mb-3"
            dangerouslySetInnerHTML={{ __html: modal.message || "" }}
          />
          <input
            autoFocus
            defaultValue={modal.defaultValue || ""}
            placeholder={modal.placeholder || ""}
            onChange={(e) => modal.onChange && modal.onChange(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </ModalShell>
      )}
    </ModalContext.Provider>
  );
}

export default ModalProvider;
