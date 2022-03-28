'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "ff30eb45a2e7b4537ae5c3f50391d75b",
"assets/assets/fonts/BebasNeue.ttf": "54413459a5adf3f82686db50595cba5a",
"assets/assets/images/avatar.png": "65ca7030c51e129a3567bd1b9a6b775e",
"assets/assets/images/bottle_outline_image.png": "a533075f785c730ff81e9e6978436700",
"assets/assets/images/categories_icon.png": "83b81d8915921fd7d55445122d3c74a4",
"assets/assets/images/cheers_outline_image.png": "1a6c3fa1d157409c4e43345251773675",
"assets/assets/images/dummy_image.png": "3422c63b142d42bd93d3e5b7e10caf36",
"assets/assets/images/empty_recipy_cal.png": "c54b04141d0c6fabe0006c0d459b4026",
"assets/assets/images/home_icon.png": "fb877d6f5847c8b3c0e5aa4bba9ab6ac",
"assets/assets/images/image.png": "4baee5f30d9d815a35d01bfb08efcd32",
"assets/assets/images/ingredients_icon.png": "f8e891f7bc58ce40f0e4fd083beb4048",
"assets/assets/images/logout.png": "02419bb395c3bf801efd141ade3274f9",
"assets/assets/images/menu_icon.png": "bd267c64217fd716c5bf31586ffe5efe",
"assets/assets/images/pf_main_logo.png": "3f8fea152da15187c226102c6abb84c4",
"assets/assets/images/purple_fizz_logo.png": "769b4bd6474145496bc64335c4ed59c9",
"assets/assets/images/recipe_cal_icon.png": "5424a9f02385bed19fb799e1d16f9d8c",
"assets/assets/images/recipe_icon.png": "2c51b50acd4f5b46dd362fe148893585",
"assets/assets/images/shopping_icon.png": "0fb13ac9695ba59b164bf51c21d4cfbd",
"assets/assets/images/toggle.png": "ed6ce00b48dbcca7927ee9ab65adacd9",
"assets/assets/images/user_icon.png": "4671f2d1c8d097033d043777460fa013",
"assets/assets/images/user_icon_filled.png": "087125a4ae76ea67e41cceff7f64dbf8",
"assets/assets/translations/en.json": "f49c16c44ef189a7afa627ec2a8ce88e",
"assets/FontManifest.json": "2925f17b036f844d8e42ff3efb302520",
"assets/fonts/MaterialIcons-Regular.otf": "7e7a6cccddf6d7b20012a548461d5d81",
"assets/NOTICES": "465723d0a5cb6d6a97ca0e052503d7b2",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"icons/Icon-maskable-192.png": "c457ef57daa1d16f64b27b786ec2ea3c",
"icons/Icon-maskable-512.png": "301a7604d45b3e739efc881eb04896ea",
"index.html": "5ff60d2a7e27ed6fe9f1b7a78bb480b9",
"/": "5ff60d2a7e27ed6fe9f1b7a78bb480b9",
"main.dart.js": "b694f00d53d0b9915b99cc93148567f2",
"manifest.json": "eae80415404a70e54e329b608056c49b",
"version.json": "cc3dc05be9d4243cc14d7b6c7e034111"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
