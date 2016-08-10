// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var uID = 1; // Default guess

// The onClicked callback function.
chrome.contextMenus.onClicked.addListener(
    function (info, tab) {
        chrome.bookmarks.update(""+info.menuItemId, {"url":tab.url});
    });

// Delete bookmark
chrome.bookmarks.onRemoved.addListener(
    function(id, removeInfo) {
        if (removeInfo.parentId == uID) {
            console.log(removeInfo);
            chrome.contextMenus.remove(id);
        }
    });

// Create bookmark
chrome.bookmarks.onCreated.addListener(
    function(id, bookmark) {
        console.log(uID);
        if (bookmark.parentId == 114) {
            console.log(bookmark);
            chrome.contextMenus.create({"title":bookmark.title,
                                    "id":bookmark.id,
                                    "contexts":['all']});
        }
});

// Change bookmark name
chrome.bookmarks.onChanged.addListener(
    function(id, changeInfo) {
        console.log(changeInfo);
        chrome.bookmarks.get(id,
            function(results) {
                if (results[0].parentId == uID) {
                    chrome.contextMenus.update(id,{"title":changeInfo.title});
                }
            }
        )

});

// Move bookmark
chrome.bookmarks.onMoved.addListener(
    function(id, moveInfo) {
        console.log(moveInfo);
        if (moveInfo.oldParentId != uID && moveInfo.parentId == uID) {
            chrome.bookmarks.get(id,
                function(results) {
                    chrome.contextMenus.create({"title":results[0].title,
                                            "id":id,
                                            "contexts":['all']});
                }
            )

        }
        if (moveInfo.oldParentId == uID && moveInfo.parentId != uID) {
            chrome.contextMenus.remove(id);
        }
});

// Set up context menu tree
function loadItems() {
    chrome.bookmarks.search("Updatable", function(results) {
        if (results.length == 0) {
            chrome.bookmarks.create({'parentId': '1','title': 'Updatable'},
                function(folder){
                    uID = folder.id;
                });
        }
        else {
            uID = results[0].id;
            chrome.bookmarks.getChildren(uID,function(children) {
                children.forEach(function(bookmark) {
                    console.log(bookmark.title);
                    chrome.contextMenus.create({"title":bookmark.title,
                                                "id":bookmark.id,
                                                "contexts":['all']});
                })
            });
        }
    });
};
loadItems();
