Haven
=====
Decentralized encryption meets centralized storage.

Technology
----------
Haven uses an Emscripten-ized Blowfish implementation originally developed for
hobinjk/enkidu to encrypt all data before it reaches the server, making it both
secure and easy to use. On the server side, a file server written in Go handles
requests for files and pages.

Todo
----
*  Switch tar implementation to Emscripten
*  WebWorker-ify as much as possible
*  Make everything pretty
*  Allow setting expiration dates for files
*  Clean up link format
*  Expose a file creation and retrieval API
