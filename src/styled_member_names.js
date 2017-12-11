class ProBoards_CLASS {

	static init(){
		this.PLUGIN_ID = "ID";

		this.setup();

		$(this.ready.bind(this));
	}

	static ready(){

	}

	static setup(){
		let plugin = pb.plugin.get(this.PLUGIN_ID);

		if(plugin && plugin.settings){
			let plugin_settings = plugin.settings;

		}
	}

}