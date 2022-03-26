import type { FieldEntity, NotifyInfo, Store, ValuedNotifyInfo } from './typings';


export class FormStore {

  // 保存数据状态的变量
  private store: Store = {};
  // 保存form表达中的Form.Item实例
  private fieldEntities: FieldEntity[] = [];
  // 保存初始值，该初始值会受到Form.props.initialValues和Form.item.props.initialValue影响
  private initialValues: Store = {};

  // 初始化initialValues，如果init为true，则顺便更新store
  public setInitialValues = (initialValues: Store | undefined, init: boolean) => {
    this.initialValues = initialValues ?? {}
    if (init) {
      this.store = { ...this.store, ...this.initialValues }
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

  // 往fieldentities注册Form.Item实例，每次Form.Item实例在componentDidMount时，都会调用该函数自身注册到fieldEntities上
  // 最后返回一个解除注册的函数
  public registerField = (entity: FieldEntity) => {
    this.fieldEntities.push(entity);
    return () => {
      this.fieldEntities = this.fieldEntities.filter(item => item !== entity)
    }
  }

  // Form.Item实例化时，执行constructor期间调用次函数来更新initialValue
  public initEntityValue = (entity: FieldEntity) => {
    const { initialValue, name } = entity.props
    if (name !== undefined) {
      const prevValue = this.store[name]
      if (prevValue === undefined) {
        this.store = { ...this.store, [name]: initialValue }
      }
    }
  }
}

