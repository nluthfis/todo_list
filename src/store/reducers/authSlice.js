import { createSlice } from "@reduxjs/toolkit";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebaseConfig";

const initialState = {
  values: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCurrentUser: (state, action) => {
      state.values = action.payload;
    },
    reset: () => initialState,
  },
});

export const { setCurrentUser, reset } = authSlice.actions;

export const getCurrentUser = () => (dispatch) => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const uid = user;
      dispatch(setCurrentUser(uid));
    } else {
      console.log("Unable to get current user");
    }
  });
};

export default authSlice.reducer;
