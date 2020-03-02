import React, { useEffect, useState, useContext } from "react";
import { auth } from "../firebase";

interface AppContextInterface {
  currentUser: firebase.User | null | undefined;

  userClaims: any;
  userRoles: undefined | string[];
}

export const AppContext = React.createContext<AppContextInterface>({
  currentUser: undefined,
  userClaims: undefined,
  userRoles: undefined,
});

export const useAppContext = () => useContext(AppContext);

interface IAppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<IAppProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState();
  const [userClaims, setUserClaims] = useState<any>();
  const [userRoles, setUserRoles] = useState<undefined | string[]>();

  useEffect(() => {
    auth.onAuthStateChanged(auth => {
      setCurrentUser(auth);
    });
  }, []);

  useEffect(() => {
    if (currentUser) {
      currentUser.getIdTokenResult(true).then(results => {
        setUserRoles(results.claims.roles || []);
        setUserClaims(results.claims);
      });
    }
  }, [currentUser]);
  return (
    <AppContext.Provider
      value={{
        currentUser,
        userClaims,
        userRoles,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
