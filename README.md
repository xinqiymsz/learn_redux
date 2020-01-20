记一次血泪史😭第一次面试阿里 自己这阵子状态非常不好 然而面试官一门催我立刻面试 于是都不用想结果 必挂 之前所有的面试都没被问到redux 自己也没太在意 结果这次redux刨根问底 呵呵😃 虽然是运气 但是自己还是有问题的 从哪跌倒从哪里爬起来💪🏻 怎么总感觉在拿阿里练手呢🤪 我晕啊 救救孩纸🙄

尝试手写一版简单的redux
#### 1.0版本-简易redux
```
const renderApp = (newState, oldState) => {
  renderScreen(newState.screen);
  renderButton(newState.button);
}

const renderScreen = (screen) => {
    
  const screenEl = document.querySelector('#screen');
  screenEl.innerHTML = screen.title;
}

const renderButton = (button) => {

  const screenEl = document.querySelector('#button');
  screenEl.innerHTML = button.text;
    
}

let reducer = (state, action) => {
  switch(action.type) {
        
      case 'PLAY_VIDEO':
          return {
              isPlaying: true,
              button: {
                text: '停止'
              },
              screen: {
                title: action.payload
              }
          }
      case 'PLAY_NEXT': 
        return {
            ...state,
            screen: {
              title: action.payload
            }
        }
      case 'STOP_VIDEO':
        return {
          isPlaying: false,
          button: {
              text: '播放'
          },
          screen: {
              title: action.payload
          }
        }
      default: return state;
    }
}

const createStore = (reducer) => {
  let state = {
      isPlaying: false,
      screen: {
        title: '停止'
      },
      button: {
        text: '播放'
      }
    }

    const getState = () => {
      return state
    }

    const dispatch = (action) => {
      state = reducer(state, action);
    };

    return { getState, dispatch };
}



const store = createStore(reducer);


document.querySelector('#button').addEventListener('click', () => {
    if(!store.getState().isPlaying) {
      store.dispatch({
        type: 'PLAY_VIDEO',
        payload: '播放'
      });
    
    } else {
      store.dispatch({
          type: 'STOP_VIDEO',
          payload: '停止'

        });
    }
  renderApp(store.getState());

});
```
>以上代码简易的模拟出来redux部分核心流程 但是每次操作我都要手动的 renderApp(store.getState());去渲染页面 以后如果一百个时间我要手动写一百行这玩意？？🤔 redux不像mobx那种响应式的模式  所以我们需要加一个发布订阅模式

`下面加上发布订阅模式的代码 将渲染页面的代码订阅出去 每次dispatch之后都会调用去更新页面`

#### 1.1版本-发布订阅去实时更新界面数据
```
const renderApp = (newState, oldState) => {
    if(newState === oldState) return;
    console.log('renderApp...');
  renderScreen(newState.screen);
  renderButton(newState.button);
}

const renderScreen = (screen) => {
    
  const screenEl = document.querySelector('#screen');
  screenEl.innerHTML = screen.title;
}

const renderButton = (button) => {

  const screenEl = document.querySelector('#button');
  screenEl.innerHTML = button.text;
    
}

let reducer = (state, action) => {
  switch(action.type) {
        
      case 'PLAY_VIDEO':
          return {
              isPlaying: true,
              button: {
                text: '停止'
              },
              screen: {
                title: action.payload
              }
          }
      case 'PLAY_NEXT': 
        return {
            ...state,
            screen: {
              title: action.payload
            }
        }
      case 'STOP_VIDEO':
        return {
          isPlaying: false,
          button: {
              text: '播放'
          },
          screen: {
              title: action.payload
          }
        }
      default: return state;
    }
}

const createStore = (reducer) => {
  let state = {
      isPlaying: false,
      screen: {
        title: '停止'
      },
      button: {
        text: '播放'
      }
    }
    let listeners = [];

    // redux三大核心方法
    const getState = () => {
      return state
    }

    const dispatch = (action) => {
      state = reducer(state, action);
      listeners.forEach(listener => listener());
    };

    const subscribe = (listener) => { // 发布订阅 每次改变store的数据不用手动的去调用更新方法 自动监听
      listeners.push(listener);
    }

    return { getState, dispatch, subscribe };
}



const store = createStore(reducer);

store.subscribe(() => {
  renderApp(store.getState());
});

document.querySelector('#button').addEventListener('click', () => {
    if(!store.getState().isPlaying) {
      store.dispatch({
        type: 'PLAY_VIDEO',
        payload: '播放'
      });
    
    } else {
      store.dispatch({
          type: 'STOP_VIDEO',
          payload: '停止'

        });
    }
});
```

>性能问题产生了 每次dispatch之后button的render也会调用screen的render也会调用 有时候单纯的改变screen不像调用button等其他render 那么我们就要判断新旧state了
![reducer源码](https://upload-images.jianshu.io/upload_images/10044574-64f39b1ea60de46d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

>这就解释了为什么reducer是纯函数了 因为他是对象之间等于这样的判断 因此是地址 对某个志修改对地址是没有任何变化的 为什么redux不实用深复制去比较呢 因为深复制层层递归去比较 也很耗费性能  因此redux的设计是只要有改动就return个新对象 否则将原来旧的state return出去 以后写代码也可以参照同样的思路

>reducer文件如果很多的话 岂不是很难维护？ 因此reducer要封装多个reducer 最终合并起来 来看以下版本👇🏻

#### 1.2版本-合并全部reducer
```
  const renderApp = (newState, oldState) => {
    if (newState === oldState) return;
    renderScreen(newState);
    renderButton(newState);
  }
  
  const renderScreen = (newState) => {

   const screenEl = document.querySelector('#screen');
    screenEl.innerHTML = newState.theme.screen.title;
    screenEl.style.color = newState.style.color;
    
  }
  
  const renderButton = (newState) => {

    const screenEl = document.querySelector('#button');
    screenEl.innerHTML = newState.theme.button.text;
      
  }
  
  let theme = (state, action) => {
    switch(action.type) {
          
        case 'PLAY_VIDEO':
            return {
                isPlaying: true,
                button: {
                  text: '停止'
                },
                screen: {
                  title: action.payload
                }
            }
    
        case 'STOP_VIDEO':
          return {
            isPlaying: false,
            button: {
                text: '播放'
            },
            screen: {
                title: action.payload
            }
          }
        default: return state;
      }
  }

  let style = (state, action) => {
    switch(action.type) {
          
        case 'PLAY_VIDEO':
            return {
               
                color: 'green'
            }
       
        case 'STOP_VIDEO':
          return {
            color: 'blue'
          }
        default: return state;
      }
  }

  let appReducer = (state, action) => {
     return {
        theme: theme(state.theme, action),
        style: style(state.style, action),
     };
  }

  const createStore = (reducer) => {
    let state = {
        theme: {
          isPlaying: false,
          button: {
            text: '播放'
          },
          screen: {
            title: '停止'
          },
        },
        style: {
          color: 'red'
        }
      }

      let listeners = [];

      // redux三大核心方法
      const getState = () => {
        return state
      }

      const dispatch = (action) => {
        state = reducer(state, action);
        listeners.forEach(listener => listener());
      };

      const subscribe = (listener) => { // 发布订阅 每次改变store的数据不用手动的去调用更新方法 自动监听
        listeners.push(listener);
      }

      return { getState, dispatch, subscribe };
  }

```

>感觉还是复杂 而且我们不能每次返回全部state state没有变化我们不需要多余的更新 // 待补充
#### 1.3版本 工具函数combineReducers

```

//   let appReducer = (state, action) => {
//     return {
//        theme: theme(state.theme, action),
//        style: style(state.style, action),
//     };
//  }
const combineReducers = (reducers) => {
  return function combination(state={}, action) {
    //reducer 的返回值是新的 state
    let newState = {};
    for(var key in reducers) {
        newState[key] = reducers[key](state[key], action);
    }
    return newState;
  }

  }
  let appReducer =  combineReducers({
        theme, style
    })
```
>有时候我们只是更新部分state 或者state没有变化我是不需要执行这一坨东西的 因此我需要判断state更新与否来减少毫无意义的渲染
#### 1.4版本 combineReducers函数优化 
```
const combineReducers = (reducers) => {
  return function combination(state={}, action) {
    //reducer 的返回值是新的 state
    let newState = {};
    let hasChange = false;
    for(var key in reducers) {
        newState[key] = reducers[key](state[key], action);
        hasChange = hasChange || newState[key] !== state[key];

    }
    return hasChange ? newState : state;
  }

  }
  let appReducer = combineReducers({
        theme, style
    })

```
![两秒后的dispatch执行之后没有任何无用的渲染](https://upload-images.jianshu.io/upload_images/10044574-7c836b97094a995e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)    

#### 中间件的实现
>比如我想在dispatch更新的前后分别打印出state 那么我们就要在内部修改dispatch
```
  const store = createStore(appReducer);
  const next = store.dispatch;

  store.dispatch = (action) => {
      console.log(store.getState(), '/old');
      next(action);
      console.log(store.getState(), '/new');
  }
```
>中间还可以记录错误信息
```
store.dispatch = (action) => {
    try {
        console.log(store.getState(), '/old');
        next(action);
        console.log(store.getState(), '/new');
      } catch(e) {
        console.log(e);
      }
      
  }
```
>如果在来100个需求 我要在dispatch函数写100个处理方式？🤪 no 我们把中间件提取出来

`把logger中间件提取出来`
```
  const loggerMiddleware = (action) => {
    console.log(store.getState(), '/old');
    next(action);
    console.log(store.getState(), '/new');
  }

  const exceptionMiddleware = (action) => {
    try {
        loggerMiddleware(action);
      } catch(e) {
        console.log(e);
      }
  }

  store.dispatch = (action) => {
    exceptionMiddleware(action)
  }
```
>疑🤔️ exceptionMiddleware里面写死了logger dispatch里面也写死了exceptionMiddleware 。。。🤪 我们要将中间件变为动态的
```
const loggerMiddleware = (next) => (action) => {
    console.log(store.getState(), '/old');
    next(action);
    console.log(store.getState(), '/new');
  }

  const exceptionMiddleware = (next) => (action) => {
    try {
        next(action);

        // loggerMiddleware(action);
      } catch(e) {
        console.log(e);
      }
  }

  store.dispatch = exceptionMiddleware(loggerMiddleware(next))
```
>但是中间件的store是全局变量导致无法真正的独立 因此store也传进来吧🤩

```
const store = createStore(appReducer);
  const next = store.dispatch;

  const loggerMiddleware = (store) => (next) => (action) => {
    console.log(store.getState(), '/old');
    next(action);
    console.log(store.getState(), '/new');
  }

  const exceptionMiddleware = (store) => (next) => (action) => {
    try {
        next(action);

        // loggerMiddleware(action);
      } catch(e) {
        console.log(e);
      }
  }
  const logger = loggerMiddleware(store);
  const exception = exceptionMiddleware(store);


  store.dispatch = exception(logger(next))
```
> 这样看起来很繁琐啊 如果我再加一个打印时间戳的中间件呢 岂不是包了好几层
```
const timeMiddleware = (store) => (next) => (action) => {
  console.log('time', new Date().getTime());
  next(action);
}

const time = timeMiddleware(store);
store.dispatch = exception(time(logger(next)));
```
>为此redux提供了一个applyMiddleware工具函数
```
const applyMiddleware = function (...middlewares) {
  // 返回一个重写createStore的方法
  return function rewriteCreateStoreFunc(oldCreateStore) {
     //返回重写后新的 createStore
    return function newCreateStore(reducer, initState) {
  
      const store = oldCreateStore(reducer, initState);
      //给每个 middleware 传下store，相当于 const logger = loggerMiddleware(store);
      
      const middlewaresArr = middlewares.map(middleware => middleware(store));
      let dispatch = store.dispatch;
      
      middlewaresArr.reverse().map(middleware => {
        dispatch = middleware(dispatch);
      });

      /*2. 重写 dispatch*/
      store.dispatch = dispatch;
      return store;
    }
  }
}
```
```
const newCreateStore = applyMiddleware(exceptionMiddleware, timeMiddleware, loggerMiddleware)(createStore);

const store = newCreateStore(reducer);
```
>这就导致了存在两个创建store 因此我们可以将两次放在一次里面
 ```
const createStore = (reducer, initState, rewriteCreateStoreFunc) => {
    // 如果有 rewriteCreateStoreFunc，那就用新的 createStore
    if(rewriteCreateStoreFunc){
       const newCreateStore =  rewriteCreateStoreFunc(createStore);
       return newCreateStore(reducer, initState);
    }
    // 否则按照正常的流程走
    ...
}

const rewriteCreateStoreFunc = applyMiddleware(exceptionMiddleware, timeMiddleware, loggerMiddleware);

const store = createStore(reducer, initState, rewriteCreateStoreFunc); //只创建一个store
```


