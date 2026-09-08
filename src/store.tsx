import { createContext, useContext, useEffect, useReducer, useState } from 'react';
import type { Dispatch, ReactNode } from 'react';
import { loadState, reducer } from './domain/state';
import type { AppState, Action } from './domain/types';
// Retain the original storage key so existing saved demo work stays available.
const KEY='chakra-demo-v2';
const Store=createContext<{state:AppState;dispatch:Dispatch<Action>;persistent:boolean}|null>(null);
export function StoreProvider({children}:{children:ReactNode}) {
 const [persistent,setPersistent]=useState(true);
 const [state,dispatch]=useReducer(reducer,undefined,()=>{try{return loadState(localStorage.getItem(KEY));}catch{return loadState(null);}});
 useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(state));setPersistent(true);}catch{setPersistent(false);}},[state]);
 return <Store.Provider value={{state,dispatch,persistent}}>{children}</Store.Provider>;
}
export function useStore(){const store=useContext(Store);if(!store)throw new Error('CI Intel store not available');return store;}
