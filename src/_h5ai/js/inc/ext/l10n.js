
module.define('ext/l10n', [jQuery, 'core/settings', 'core/langs', 'core/format', 'core/store', 'core/event'], function ($, allsettings, langs, format, store, event) {

	var defaults = {
			enabled: true,
			lang: 'en',
			useBrowserLang: true
		},

		settings = _.extend({}, defaults, allsettings.l10n),

		template = '<span id="langSelector">' +
						'<span class="lang">en</span> - <span class="l10n-lang">english</span>' +
						'<span class="langOptions"> <ul /> </span>' +
					'</span>',
		langOptionTemplate = '<li class="langOption" />',

		storekey = 'h5ai.language',

		currentLang = null,

		localize = function (langs, lang, useBrowserLang) {

			var storedLang = store.get(storekey);

			if (langs[storedLang]) {
				lang = storedLang;
			} else if (useBrowserLang) {
				var browserLang = navigator.language || navigator.browserLanguage;
				if (browserLang) {
					if (langs[browserLang]) {
						lang = browserLang;
					} else if (browserLang.length > 2 && langs[browserLang.substr(0, 2)]) {
						lang = browserLang.substr(0, 2);
					}
				}
			}

			if (!langs[lang]) {
				lang = 'en';
			}

			currentLang = langs[lang];
			if (currentLang) {
				$.each(currentLang, function (key, value) {
					$('.l10n-' + key).text(value);
				});
				$('.lang').text(lang);
				$('.langOption').removeClass('current');
				$('.langOption.' + lang).addClass('current');
			}

			format.setDefaultDateFormat(currentLang.dateFormat);

			$('#extended .entry .date').each(function () {

				var $this = $(this);

				$this.text(format.formatDate($this.data('time')));
			});
		},

		initLangSelector = function (langs) {

			var $langSelector = $(template).appendTo('#bottombar .right'),
				$langOptions = $langSelector.find('.langOptions'),
				$ul = $langOptions.find('ul'),
				sortedLangsKeys = [];

			$.each(langs, function (lang) {
				sortedLangsKeys.push(lang);
			});
			sortedLangsKeys.sort();

			$.each(sortedLangsKeys, function (idx, lang) {
				$(langOptionTemplate)
					.addClass(lang)
					.text(lang + ' - ' + langs[lang].lang)
					.appendTo($ul)
					.click(function () {
						store.put(storekey, lang);
						localize(langs, lang, false);
					});
			});
			$langOptions
				.append($ul)
				.scrollpanel();

			$langSelector.hover(
				function () {
					$langOptions
						.css('top', '-' + $langOptions.outerHeight() + 'px')
						.stop(true, true)
						.fadeIn();

					// needs to be updated twice for initial fade in rendering :/
					$langOptions.scrollpanel('update').scrollpanel('update');
				},
				function () {
					$langOptions
						.stop(true, true)
						.fadeOut();
				}
			);
		},

		init = function () {

			if (!settings.enabled) {
				return;
			}

			initLangSelector(langs);

			event.sub('ready', function () {

				localize(langs, settings.lang, settings.useBrowserLang);
			});
		};

	init();
});
