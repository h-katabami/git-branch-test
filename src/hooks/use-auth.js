import { Auth } from "@aws-amplify/auth";
import { Amplify } from "@aws-amplify/core";
import { createContext, useContext, useEffect, useState } from "react";
import AwsConfigAuth from "../aws-config/auth";

Amplify.configure({ Auth: AwsConfigAuth });

const authContext = createContext({});

export const ProvideAuth = ({ children }) => {
  const auth = useProvideAuth();
  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
};

export const useAuth = () => {
  return useContext(authContext);
};

const useProvideAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // const [idToken, setIdToken] = useState({});// user オブジェクトに含むことを検討
  const [username, setUsername] = useState("");
  const [user, setUser] = useState("");
  const [error, setError] = useState(null); // エラーメッセージを管理するステート

  useEffect(() => {
    const fetchCurrentUser = async () => {
      setIsLoading(true);
      setError(null); // 初期化

      try {
        const currentUser = await Auth.currentAuthenticatedUser();
        // setIdToken(currentUser.signInUserSession.idToken.jwtToken);

        setUsername(currentUser.username);
        setIsAuthenticated(true);
        setUser(currentUser);
      } catch (error) {
        setUsername("");
        setIsAuthenticated(false);
        setUser(null);
        // エラーハンドリング
        console.error("認証情報の取得に失敗しました:", error);
        // 必要に応じてsetError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  /**
   * ユーザーが認証済みかどうかを確認する
   */
  const checkAuthenticated = async () => {
    setIsLoading(true);
    setError(null); // 初期化
    try {
      await Auth.currentSession();
      setIsAuthenticated(true);
    } catch (error) {
      console.log("current session error", error);
      setIsAuthenticated(false);
      // 必要に応じてsetError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 現在のセッショントークンを取得する
   */
  const currentSessionToken = async () => {
    try {
      const currentAuthUser = await Auth.currentAuthenticatedUser();
      const session = await Auth.userSession(currentAuthUser);
      if (!session?.isValid()) {
        setIsAuthenticated(false);
        return null;
      } else {
        setIsAuthenticated(true);
        return session.idToken.jwtToken;
      }
    } catch (error) {
      console.error("セッショントークンの取得に失敗しました:", error);
      // 必要に応じてsetError(error.message);
      return null;
    }
  };
  /**
   * サインイン
   */
  const signIn = async (username, password) => {
    setIsLoading(true);
    setError(null); // 初期化
    try {
      const result = await Auth.signIn(username, password);
      if (result.challengeName === "NEW_PASSWORD_REQUIRED") {
        setUsername(result.username);
        setIsAuthenticated(true);
        setUser(result);
        return {
          success: true,
          passwordRequired: true,
          message: "パスワード強制変更が必要です。",
        };
      } else {
        setUsername(result.username);
        setIsAuthenticated(true);
        setUser(result);
        // setIdToken(result.signInUserSession.idToken.jwtToken);
        return {
          success: true,
          passwordRequired: false,
          message: "",
        };
      }
    } catch (error) {
      console.error("サインインに失敗しました:", error);
      setError("認証に失敗しました。");
      return {
        success: false,
        message: "認証に失敗しました。",
      };
    } finally {
      setIsLoading(false);
    }
  };
  /**
   * 初回ログイン時のパスワード強制変更
   */
  const passwordRequired = async (currentUser, newPassword) => {
    setIsLoading(true);
    setError(null); // 初期化
    try {
      const result = await Auth.completeNewPassword(currentUser, newPassword, {
        name: username,
      });
      setUsername(currentUser.username);
      setIsAuthenticated(true);
      // setIdToken(result.signInUserSession.idToken.jwtToken);
      return {
        success: true,
        passwordRequired: false,
        message: "",
      };
    } catch (error) {
      console.error("パスワード変更に失敗しました:", error);
      setError("ログインに失敗しました。");
      return {
        success: false,
        passwordRequired: false,
        message: "ログインに失敗しました。",
      };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * パスワード変更
   */
  const passwordChange = async (oldPassword, newPassword) => {
    setIsLoading(true);
    setError(null); // 初期化
    try {
      const currentUser = await Auth.currentAuthenticatedUser();
      await Auth.changePassword(currentUser, oldPassword, newPassword);
      return { success: true, message: "" };
    } catch (error) {
      console.error("パスワード変更に失敗しました:", error);
      setError("パスワード変更に失敗しました。");
      return { success: false, message: "パスワード変更に失敗しました。" };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * サインアウト
   */
  const signOut = async () => {
    setIsLoading(true);
    setError(null); // 初期化
    try {
      await Auth.signOut();
      setUsername("");
      setIsAuthenticated(false);
      setUser(null);
      return { success: true, message: "" };
    } catch (error) {
      console.error("ログアウトに失敗しました:", error);
      setError("ログアウトに失敗しました。");
      return {
        success: false,
        message: "ログアウトに失敗しました。",
      };
    } finally {
      setIsLoading(false);
    }
  };
  /**
   * ユーザー情報更新 会社設定変更
   */
  const userEdit = async (company) => {
    setIsLoading(true);
    setError(null); // 初期化
    try {
      const currentUser = await Auth.currentAuthenticatedUser();
      const result = await Auth.updateUserAttributes(currentUser, {
        "custom:temp_company": company,
      });
      if (result === "SUCCESS") {
        return { success: true };
      } else {
        return { success: false };
      }
    } catch (error) {
      console.error("ユーザー情報の更新に失敗しました:", error);
      setError("ユーザー情報の更新に失敗しました。");
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    isAuthenticated,
    // idToken,
    username,
    user,
    error, // エラーメッセージを追加
    checkAuthenticated,
    currentSessionToken,
    signIn,
    passwordRequired,
    passwordChange,
    signOut,
    userEdit,
  };
};
