import { useEffect, useMemo, useRef } from "react";
import WrapperField from "./Field";
import FieldContext, { FieldContextValueType } from "./FieldContext";
import { FormStore } from "./FormStore";
import type { Store } from "./typings";

type BaseFormProps = Omit<
  React.FormHTMLAttributes<HTMLFormElement>,
  "onSubmit"
>;
// 第一阶段的props需要实现的参数只有initialValues、children
export type FormProps = BaseFormProps & {
  initialValues?: Store;
  onFinish?: (values: any) => void;
  onValueChange?: (
    changeValue: Record<string, any>,
    values: Record<string, any>
  ) => void;
  children?: React.ReactNode;
};

const Form = (props: FormProps) => {
  const { initialValues, children, onFinish, onValueChange } = props;
  // formStore的实例就是表单的数据状态和fieldEntities的对象
  const formStore = useRef<FormStore>(new FormStore(initialValues ?? {}));
  const mountRef = useRef(false);

  // 初始化回调函数
  useEffect(() => {
    formStore.current.setCallback({ onFinish, onValueChange });
  }, [onFinish, onValueChange]);
  if (!mountRef.current) {
    mountRef.current = true;
  }

  // 创建fieldContextValue用于注入到下面的FieldContext
  // 注入后子组件都能访问fieldContextValue
  const fieldContextValue = useMemo<FieldContextValueType>(
    () => ({
      formStore: formStore.current,
    }),
    []
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        formStore.current.submit();
      }}
      onReset={(e) => {
        e.preventDefault();
        e.stopPropagation();
        formStore.current.reset();
      }}
    >
      <FieldContext.Provider value={fieldContextValue}>
        {children}
      </FieldContext.Provider>
    </form>
  );
};
Form.Item = WrapperField;
export default Form;
