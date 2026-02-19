const store = {
	state: () => ({
		text: "",
		error: false,
		active: false,
		auto_close: true,
	}),

	mutations: {
		add(state, { text = "", error = false, active = true }) {
			state.text = text;
			state.error = error;
			state.active = active;
			state.auto_close = true;
		},
		auto_close(state, payload) {
			state.auto_close = payload;
		},
	},

	actions: {
		add({ commit, dispatch }, payload) {
			commit("add", payload);
			setTimeout(() => dispatch("check"), 5000);
		},
		check({ dispatch, state }) {
			if (state.auto_close) dispatch("close");
		},
		close({ commit, state }) {
			commit("add", { active: false, text: state.text, error: state.error });
		},
		can_remove({ commit }, payload) {
			commit("auto_close", payload);
		},
	},
};

export default store;
