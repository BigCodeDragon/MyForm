import React from "react";
import FieldContext, {  } from "./FieldContext";
import { FieldEntity, FieldProps,   } from "./typings";

// 这里WrapperField作用主要在于把FieldContext的值提取出来注入到Field
// 为什么不直接在Field中获取fieldContext呢？原因如下：
// Field由于要把自身实例注册到formStore.fieldEntities里，因此自身设计成类组件而非函数组件，
// 而在类函数中获取FieldContext中的fieldContext有两种方法：Context.Provider 和 contextType
//    1. Context.Provider获取的fieldContext只能在jsx中使用，很不便
//    2. contextType只能针对只有一个Context的情况。在真实源码中有多个Context，如针对FormProvider的FormContext和size的SizeContext
// 因此，这里提前把fieldContext提取出来注入到Field上
const WrapperField = (props: Omit<FieldProps, "fieldContext">) => {
  const fieldContext = React.useContext(FieldContext);
  return (
    // 这里简单写一下label的布局，因为不是我们这篇文章探讨的重点，真实源码上使用antd的Row和Col做布局的。
    <div style={{ display: "flex", marginBottom: 12 }}>
      <div style={{ width: 100 }}>{props.label}</div>
      <Field {...props} fieldContext={fieldContext} />
    </div>
  );
};
export interface FieldState {
  resetCount: number;
}
class Field
  extends React.Component<FieldProps, FieldState>
  implements FieldEntity
{
  private mounted = false;
  constructor(props: FieldProps) {
    super(props);
    const { formStore } = props.fieldContext;
    // 更改formStore的initialValue
    formStore.initEntityValue!(this);
  }
  public componentDidMount() {
    this.mounted = true;
    this.props.fieldContext.formStore.registerField!(this);
  }
  public onStoreChange: FieldEntity["onStoreChange"] = (
    prevStore,
    namePathList,
    info
  ) => {
    const { store } = info;
    const { name } = this.props;
    const preValue = store[name!];
    const curValue = prevStore[name!];
    const nameMatch = namePathList && namePathList.includes(name!);
    switch (info.type) {
      default:
        if (nameMatch || (name && curValue !== preValue)) {
          this.reRender();
        }
        break;
    }
  };
  // 如果已经挂载了，就可以牵制更新
  public reRender() {
    if (this.mounted) {
      this.forceUpdate();
    }
  }

  // 生成要通过React.cloneElement隐式混入到控件里的prop
  public getControlled(childProps: any = {}) {
    const {
      trigger = "onChange",
      name,
      valuePropName = "value",
      fieldContext,
      getValueFromEvent,
    } = this.props;
    const value = name
      ? fieldContext.formStore.getFieldValue!(name)
      : '';
    const control: any = {
      ...childProps,
      [valuePropName]: value,
    };
   
    
    // 去除原本在控件上定义的触发事件
    const originTriggerFunc = childProps[trigger];
    // 增强回调触发方法
    control[trigger] = (...args: any[]) => {
      let newValue: any;
      if (getValueFromEvent) {
        newValue = getValueFromEvent(...args);
      } else {
        newValue = defaultGetValueFromEvent(...args);
      }
      // 控件触发后需要更新formStore里的值
      fieldContext.formStore.updateValue!(name, newValue);
      if (originTriggerFunc) {
        originTriggerFunc(...args);
      }
    };
    console.log(control);
    return control;
  }

  public render() {
    const { children } = this.props;
    if (React.isValidElement(children)) {
      return React.cloneElement(children, this.getControlled(children.props));
    }
    return children;
  }
}

export default WrapperField;
// 用于通过默认在回调事件里获取输入值的方法
function defaultGetValueFromEvent(...args: any[]): any {
  return args?.[0]?.target?.value ?? undefined;
}
