  const renderApp = (newState, oldState) => {
    if (newState === oldState) return;
    renderScreen(newState);
    renderButton(newState);
  }
  
  const renderScreen = (newState) => {
    console.log('screen....');
    const screenEl = document.querySelector('#screen');
    screenEl.innerHTML = newState.theme.screen.title;
    screenEl.style.color = newState.style.color;
    
  }
  
  const renderButton = (newState) => {
    console.log('button....');
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
        case 'PLAY': 
           return {
               color: 'yellow'
           }
       
        case 'STOP_VIDEO':
          return {
            color: 'blue'
          }
        default: return state;
      }
  }

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
  

  const createStore = (reducer, rewriteCreateStoreFunc) => {
    
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

      if (rewriteCreateStoreFunc) {
        const newCreateStore = rewriteCreateStoreFunc(createStore);
        return newCreateStore(reducer);
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

  // const loggerMiddleware = (store) => (next) => (action) => {
  //   console.log(store.getState(), '/old');
  //   next(action);
  //   console.log(store.getState(), '/new');
  // }

  // const exceptionMiddleware = (store) => (next) => (action) => {
  //   try {
  //       next(action);

  //       // loggerMiddleware(action);
  //     } catch(e) {
  //       console.log(e);
  //     }
  // }

  // const timeMiddleware = (store) => (next) => (action) => {
  //   console.log('time', new Date().getTime());
  //   next(action);
  // }

  const loggerMiddleware = store =>next => (action) => {
    console.log(store.getState(), '/old');
    next(action);
    console.log(store.getState(), '/new');
  }

  const exceptionMiddleware = store => (next) => (action) => {
    try {
       next(action)
      } catch(e) {
        console.log(e);
      }
  }
  const timeMiddleware = store => (next) => (action) => {
    console.log(new Date().getTime());
    next(action)
  }

  const applyMiddleware = function (...middlewares) {
    return function rewriteCreateStoreFunc(oldCreateStore) {
      return function newCreateStore(reducer) {
        const store = oldCreateStore(reducer);
        // 给每个 middleware 传下store
        const chain = middlewares.map(middleware => middleware(store));
        let dispatch = store.dispatch;
        // 实现 exception(time((logger(dispatch))))
        chain.reverse().map(middleware => {
          dispatch = middleware(dispatch);
        });
  
        // 重写 dispatch
        store.dispatch = dispatch;
        return store;
      }
    }
  }

  const rewriteCreateStoreFunc = applyMiddleware(exceptionMiddleware, loggerMiddleware, timeMiddleware);


  const store = createStore(appReducer, rewriteCreateStoreFunc);
  
  // let oldState = store.getState();

  store.subscribe(() => { 
      const newState = store.getState();
      renderApp(newState);
      // oldState = newState;
  }); // 重新渲染的逻辑 发布订阅模式
 

  document.querySelector('#button').addEventListener('click', () => {
      if(!store.getState().theme.isPlaying) {
        store.dispatch({
          type: 'PLAY_VIDEO',
          payload: '播放'
        });
        // setTimeout(() => {
            
        //   store.dispatch({});
        //   console.log('state没有任何更新');
        // }, 2000)
      } else {
        store.dispatch({
            type: 'STOP_VIDEO',
            payload: '停止'

          });
      }
  });