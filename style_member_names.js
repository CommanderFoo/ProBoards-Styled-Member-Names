$(function(){

	({

		auto_form: [],

		group_auto_form: [],

		init: function(){
			this.setup();

			var location_check = (
				yootil.location.check.search_results() ||
				yootil.location.check.message_thread() ||
				yootil.location.check.thread() ||
				yootil.location.check.recent_posts() ||
				yootil.location.check.recent_threads() ||
				yootil.location.check.message_list() ||
				yootil.location.check.members()
			);

			if(this.auto_form.length || this.group_auto_form.length){
				this.style_members();

				if(location_check){
					yootil.ajax.after_search(this.style_paged_members, this);
				}

				if($(".shoutbox.container").length){
					this.monitor_shoutbox();
				}
			}
		},

		setup: function(){
			var plugin = proboards.plugin.get("pixeldepth_styled_names");
			var settings = (plugin && plugin.settings)? plugin.settings : false;

			if(settings){
				if(settings.styled_members && settings.styled_members.length){
					this.auto_form = settings.styled_members;
				}

				if(settings.styled_groups && settings.styled_groups.length){
					this.group_auto_form = settings.styled_groups;
				}
			}
		},

		monitor_shoutbox: function(){
			var self = this;

			$.ajaxPrefilter(function(opts, orig_opts){
				if(orig_opts.url == proboards.data("shoutbox_update_url")){
					var orig_success = orig_opts.success;

					opts.success = function(){
						orig_success.apply(this, self.parse_realtime.apply(self, arguments));
					};
				}
			});
		},

		parse_realtime: function(){
			if(arguments && arguments.length && arguments[0].shoutbox_post){
				var container = $("<span />").html(arguments[0].shoutbox_post);
				var posts = container.find("div.shoutbox-post");

				this.style_members(posts);
				arguments[0].shoutbox_post = container.html();
			}

			return arguments || [];
		},

		style_members: function(posts){
			for(var g = 0, gl = this.group_auto_form.length; g < gl; g ++){
				var gaf = this.group_auto_form[g];
				var groups = gaf.groups;
				var self = this;
				var users = [];

				$.each(groups, function(i, v){
					if(posts){
						posts.each(function(){
							var user_links = $(this).find("a.user-link.group-" + v);

							if(user_links.length){
								users.push(user_links);
							}
						});
					} else {
						var user_links = $("a.user-link.group-" + v);

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

			for(var m = 0, ml = this.auto_form.length; m < ml; m ++){
				var maf = this.auto_form[m];
				var members = maf.members;
				var self = this;
				var users = [];

				$.each(members, function(i, v){
					if(posts){
						posts.each(function(){
							var user_links = $(this).find("a.user-link[href$=\\/user\\/" + v + "]");

							if(user_links.length){
								users.push(user_links);
							}
						});
					} else {
						var user_links = $("a.user-link[href$=\\/user\\/" + v + "]:not([data-pd-styled])");

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

		},

		apply_styles: function(styles, users){
			var bold = styles.bold;
			var colour = styles.colour;
			var custom_css = styles.custom_css;

			if(bold || colour || custom_css){
				var css = {};

				if(bold && bold == 1){
					css["font-weight"] = "bold";
				}

				if(colour && colour.length){
					css.color = "#" + colour;
				}

				if(custom_css && custom_css.length){
					var parts = custom_css.split(";");

					for(var p = 0, pl = parts.length; p < pl; p ++){
						var props = parts[p].split(":");

						if(props.length == 2){
							css[$.trim(props[0])] = $.trim(props[1]);
						}
					}
				}

				users.css(css);
				users.attr("data-pd-styled", "1");
			}
		},

		style_paged_members: function(){
			var member_links = $("a.user-link");

			if(member_links.attr("data-pd-styled")){
				return;
			}

			this.style_members();
		}

	}).init();

});