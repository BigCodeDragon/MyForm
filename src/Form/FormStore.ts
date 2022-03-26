import type { Callbacks, FieldEntity, NotifyInfo, Store, ValuedNotifyInfo } from './typings';

export class FormStore {

  // 保存数据状态的变量
  private store: Store = {};
  // 保存form表达中的Form.Item实例
  private fieldEntities: FieldEntity[] = [];
  // 保存初始值，该初始值会受到Form.props.initialValues和Form.item.props.initialValue影响
  private initialValues: Store = {};
  // constructor(initialValues: Store) {
  //   this.store = { ...this.store, ...initialValues ?? {} }
  //   this.initialValues = initialValues
  // }
  private callbacks: Callbacks = {}
  public setCallback = (callbacks: Callbacks) => {
    this.callbacks = callbacks;
  }
  // 提交表达
  public submit = () => {
    const { onFinish } = this.callbacks
    if (onFinish) {
      onFinish(this.store)
    }
  }


  // 根据name获取store中的值
  public getFieldValue = (name: string) => {
    return this.store[name] ?? ''
  }

  // 获取整个store
  public getFieldsValue = () => {
    return this.store
  }

  // 内部更新store的函数
  public updateValue = (name: string | undefined, value: any) => {
    if (name === undefined) return
    const prevStore = this.store
    this.store = { ...this.store, [name]: value }
    this.notifyObservers(prevStore, [name], {
      type: 'valueUpdate',
      sourece: 'internal',
    })
    const { onValueChange } = this.callbacks
    if (onValueChange) {
      onValueChange({ [name]: value }, this.getFieldsValue())
    }
  }

  // 获取那些带name的Form.Item实例
  public getFieldEntities = () => {
    return this.fieldEntities.filter(item => item.props.name)
  }


  // 生成更新信息mergedInfo且遍历所有的Form.Item实例调用其onStoreChange方法去判断是否需要更新执行
  public notifyObservers = (
    prevStore: Store,
    namePathList: string[] | undefined,
    info: NotifyInfo,
  ) => {
    const mergedInfo: ValuedNotifyInfo = {
      ...info,
      store: this.getFieldsValue(),
    };
    this.getFieldEntities().forEach(({ onStoreChange }) => {
      onStoreChange(prevStore, namePathList, mergedInfo);
    });
  };
  public reset = (nameList?: string[]) => {
    const prevStore = this.store;
    // nameList没传，直接重置整个表单
    if (!nameList) {
      this.store = { ...this.initialValues }

    } else {
      nameList.forEach(name => {
        this.store[name] = this.initialValues[name]
      })
    }
    this.notifyObservers(prevStore, nameList, { type: 'reset' });


  }
  public setInitialValues = (values: Record<string, any> | undefined) => {
    this.initialValues = values ?? {};
    this.store = { ...this.store, ...this.initialValues }
  }


  // resetWithFieldInitialValue是用于根据Form.Item上的initialValue调整store
  // 其逻辑是：遍历fieldEntities，如果实例上有定义initialValue和name，
  // 且this.initialValue[name]为undefined，则把实例上定义的initialValue赋值到store上
  private resetWithFieldInitialValue = (info: {
    entities?: FieldEntity[];
    nameList?: string[];
  } = {},) => {

    // 遍历储存起来，便于后面取值
    const cache: Record<string, FieldEntity> = {}
    this.getFieldEntities().forEach(entity => {
      const { name, initialValue } = entity.props
      if (initialValue) {
        cache[name!] = entity
      }
    })
    let requiredFieldEntities: FieldEntity[] = [];
    // 重置一部分entities数组里的表单, entities优先级比nameList高
    if (info.entities) {
      requiredFieldEntities = info.entities
    } else if (info.nameList) {
      info.nameList.forEach(name => {
        if (cache[name]) {
          requiredFieldEntities.push(cache[name])
        }
      })
    } else {
      // 重置所有表单项
      requiredFieldEntities = this.fieldEntities;
    }
    const resetWithFields = (entities: FieldEntity[]) => {
      entities.forEach(entity => {
        const { initialValue, name } = entity.props;
        if (initialValue !== undefined && name !== undefined) {
          const formInitialValue = this.initialValues[name];
          if (formInitialValue === undefined) {
            this.store[name] = initialValue;
          }
        }

      })
    }
    resetWithFields(requiredFieldEntities)
  }
  // 往fieldentities注册Form.Item实例，每次Form.Item实例在componentDidMount时，都会调用该函数自身注册到fieldEntities上
  // 最后返回一个解除注册的函数
  public registerField = (entity: FieldEntity) => {
    this.fieldEntities.push(entity);
    return () => {
      this.fieldEntities = this.fieldEntities.filter(item => item !== entity)
    }
  }

  // Form.Item实例化时，执行constructor期间调用此函数来更新initialValue
  public initEntityValue = (entity: FieldEntity) => {
    const { initialValue, name } = entity.props
    if (name !== undefined) {
      if (initialValue) {
        this.initialValues = { ...this.initialValues, [name]: initialValue }
      }
      const prevValue = this.store[name]
      if (prevValue === undefined) {
        this.store = { ...this.store, [name]: initialValue }
      }
    }
  }
}

