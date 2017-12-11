"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Styled_Member_Names = function () {
	function Styled_Member_Names() {
		_classCallCheck(this, Styled_Member_Names);
	}

	_createClass(Styled_Member_Names, null, [{
		key: "init",
		value: function init() {
			this.PLUGIN_ID = "pixeldepth_styled_names";
			this.settings = {};

			this.setup();

			if (!this.settings.styled_members.length > 0 && !this.settings.styled_groups.length > 0) {
				return;
			}

			$(this.ready.bind(this));
		}
	}, {
		key: "ready",
		value: function ready() {
			var location_check = yootil.location.search_results() || yootil.location.message_thread() || yootil.location.thread() || yootil.location.recent_posts() || yootil.location.recent_threads() || yootil.location.message_list() || yootil.location.members() || yootil.location.board();

			this.style_members();

			if (location_check) {
				yootil.event.after_search(this.style_members, this);
			}

			if ($(".shoutbox.container").length > 0) {
				this.monitor_shoutbox();
			}
		}
	}, {
		key: "setup",
		value: function setup() {
			var plugin = pb.plugin.get(this.PLUGIN_ID);

			if (plugin && plugin.settings) {
				this.settings = plugin.settings;
			}
		}
	}, {
		key: "monitor_shoutbox",
		value: function monitor_shoutbox() {
			var self = this;

			$.ajaxPrefilter(function (opts, orig_opts) {
				if (orig_opts.url == proboards.data("shoutbox_update_url")) {
					var orig_success = orig_opts.success;

					opts.success = function () {
						orig_success.apply(this, self.parse_realtime.apply(self, arguments));
					};
				}
			});
		}
	}, {
		key: "parse_realtime",
		value: function parse_realtime() {
			if (arguments && arguments.length && arguments[0].shoutbox_post) {
				var container = $("<span />").html(arguments[0].shoutbox_post);
				var posts = container.find("div.shoutbox-post");

				this.style_members(posts);
				arguments[0].shoutbox_post = container.html();
			}

			return arguments || [];
		}
	}, {
		key: "style_members",
		value: function style_members(posts) {
			var _this = this;

			var _loop = function _loop(g, gl) {
				var gaf = _this.settings.styled_groups[g];
				var groups = gaf.groups;
				var self = _this;
				var users = [];

				$.each(groups, function (i, v) {
					if (posts) {
						posts.each(function () {
							var user_links = $(this).find("a.user-link.group-" + v);

							if (user_links.length) {
								users.push(user_links);
							}
						});
					} else {
						var user_links = $("a.user-link.group-" + v);

						if (user_links.length) {
							users.push(user_links);
						}
					}
				});

				if (users.length) {
					$.each(users, function (i, v) {
						self.apply_styles(gaf, v);
					});
				}
			};

			for (var g = 0, gl = this.settings.styled_groups.length; g < gl; ++g) {
				_loop(g, gl);
			}

			var _loop2 = function _loop2(m, ml) {
				var maf = _this.settings.styled_members[m];
				var members = maf.members;
				var self = _this;
				var users = [];

				$.each(members, function (i, v) {
					if (posts) {
						posts.each(function () {
							var user_links = $(this).find("a.user-link[href$=\\/user\\/" + v + "]");

							if (user_links.length) {
								users.push(user_links);
							}
						});
					} else {
						var user_links = $("a.user-link[href$=\\/user\\/" + v + "]");

						if (user_links.length) {
							users.push(user_links);
						}
					}
				});

				if (users.length) {
					$.each(users, function (i, v) {
						self.apply_styles(maf, v);
					});
				}
			};

			for (var m = 0, ml = this.settings.styled_members.length; m < ml; ++m) {
				_loop2(m, ml);
			}
		}
	}, {
		key: "apply_styles",
		value: function apply_styles(styles, users) {
			var bold = styles.bold;
			var colour = styles.colour;
			var custom_css = styles.custom_css;

			if (bold || colour || custom_css) {
				var css = Object.assign(Object.create(null));

				if (bold && bold == 1) {
					css["font-weight"] = "bold";
				}

				if (colour && colour.length) {
					css.color = "#" + colour;
				}

				if (custom_css && custom_css.length) {
					var parts = custom_css.split(";");

					for (var p = 0, pl = parts.length; p < pl; ++p) {
						var props = parts[p].split(":");

						if (props.length == 2) {
							css[$.trim(props[0])] = $.trim(props[1]);
						}
					}
				}

				users.css(css);
			}
		}
	}]);

	return Styled_Member_Names;
}();


Styled_Member_Names.init();