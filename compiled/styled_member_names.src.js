class Styled_Member_Names {

	static init(){
		this.PLUGIN_ID = "pixeldepth_styled_names";
		this.settings = {};

		this.setup();

		if(!this.settings.styled_members.length > 0 && !this.settings.styled_groups.length > 0){
			return;
		}

		$(this.ready.bind(this));
	}

	static ready(){
		let location_check = (
			yootil.location.search_results() ||
			yootil.location.message_thread() ||
			yootil.location.thread() ||
			yootil.location.recent_posts() ||
			yootil.location.recent_threads() ||
			yootil.location.message_list() ||
			yootil.location.members() ||
			yootil.location.board()
		);

		this.style_members();

		if(location_check){
			yootil.event.after_search(this.style_members, this);
		}

		if($(".shoutbox.container").length > 0){
			this.monitor_shoutbox();
		}
	}

	static setup(){
		let plugin = pb.plugin.get(this.PLUGIN_ID);

		if(plugin && plugin.settings){
			this.settings = plugin.settings;
		}
	}

	static monitor_shoutbox(){
		let self = this;

		$.ajaxPrefilter(function(opts, orig_opts){
			if(orig_opts.url == proboards.data("shoutbox_update_url")){
				let orig_success = orig_opts.success;

				opts.success = function(){
					orig_success.apply(this, self.parse_realtime.apply(self, arguments));
				};
			}
		});
	}

	static parse_realtime(){
		if(arguments && arguments.length && arguments[0].shoutbox_post){
			let container = $("<span />").html(arguments[0].shoutbox_post);
			let posts = container.find("div.shoutbox-post");

			this.style_members(posts);
			arguments[0].shoutbox_post = container.html();
		}

		return arguments || [];
	}

	static style_members(posts){
		for(let g = 0, gl = this.settings.styled_groups.length; g < gl; ++ g){
			let gaf = this.settings.styled_groups[g];
			let groups = gaf.groups;
			let self = this;
			let users = [];

			$.each(groups, function(i, v){
				if(posts){
					posts.each(function(){
						let user_links = $(this).find("a.user-link.group-" + v);

						if(user_links.length){
							users.push(user_links);
						}
					});
				} else {
					let user_links = $("a.user-link.group-" + v);

					if(user_links.length){
						users.push(user_links);
					}
				}
			});

			if(users.length){
				$.each(users, function(i, v){
					self.apply_styles(gaf, v);
				});
			}
		}

		for(let m = 0, ml = this.settings.styled_members.length; m < ml; ++ m){
			let maf = this.settings.styled_members[m];
			let members = maf.members;
			let self = this;
			let users = [];

			$.each(members, function(i, v){
				if(posts){
					posts.each(function(){
						let user_links = $(this).find("a.user-link[href$=\\/user\\/" + v + "]");

						if(user_links.length){
							users.push(user_links);
						}
					});
				} else {
					let user_links = $("a.user-link[href$=\\/user\\/" + v + "]");

					if(user_links.length){
						users.push(user_links);
					}
				}
			});

			if(users.length){
				$.each(users, function(i, v){
					self.apply_styles(maf, v);
				});
			}
		}
	}

	static apply_styles(styles, users){
		let bold = styles.bold;
		let colour = styles.colour;
		let custom_css = styles.custom_css;

		if(bold || colour || custom_css){
			let css = Object.assign(Object.create(null));

			if(bold && bold == 1){
				css["font-weight"] = "bold";
			}

			if(colour && colour.length){
				css.color = "#" + colour;
			}

			if(custom_css && custom_css.length){
				let parts = custom_css.split(";");

				for(let p = 0, pl = parts.length; p < pl; ++ p){
					let props = parts[p].split(":");

					if(props.length == 2){
						css[$.trim(props[0])] = $.trim(props[1]);
					}
				}
			}

			users.css(css);
		}
	}

}

Styled_Member_Names.init();