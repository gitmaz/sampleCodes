/**
 * This controller does the responsibility of uploading a file with drag&drop capability
 * source from https://codepen.io/Kjaer/pen/gCvft by Hail Kayer (not my own work)
 */
angular.module('app', [], function () {
})
FileUploadController.$inject = ['$scope', '$rootScope']
function FileUploadController(scope, rootScope) {
    //============== DRAG & DROP =============
    // source for drag&drop: http://www.webappers.com/2011/09/28/drag-drop-file-upload-with-html5-javascript/
    var dropbox = document.getElementById("dropbox")
    scope.dropText = 'Drop csv file here...'

    // init event handlers
    function dragEnterLeave(evt) {
        evt.stopPropagation()
        evt.preventDefault()
        scope.$apply(function () {
            scope.dropText = 'Drop csv file here...'
            scope.dropClass = ''
        })
    }

    dropbox.addEventListener("dragenter", dragEnterLeave, false)
    dropbox.addEventListener("dragleave", dragEnterLeave, false)
    dropbox.addEventListener("dragover", function (evt) {
        evt.stopPropagation()
        evt.preventDefault()
        var clazz = 'not-available'
        var ok = evt.dataTransfer && evt.dataTransfer.types && evt.dataTransfer.types.indexOf('Files') >= 0
        scope.$apply(function () {
            scope.dropText = ok ? 'Drop csv file here...' : 'Only files are allowed!'
            scope.dropClass = ok ? 'over' : 'not-available'
        })
    }, false)
    dropbox.addEventListener("drop", function (evt) {
        console.log('drop evt:', JSON.parse(JSON.stringify(evt.dataTransfer)))
        evt.stopPropagation()
        evt.preventDefault()
        scope.$apply(function () {
            scope.dropText = 'Drop csv file here...'
            scope.dropClass = ''
        })
        var files = evt.dataTransfer.files
        if (files.length > 0) {
            scope.$apply(function () {
                scope.files = []
                for (var i = 0; i < files.length; i++) {
                    scope.files.push(files[i])
                }

                scope.uploadFile();
            })
        }
    }, false)
    //============== DRAG & DROP =============

    scope.setFiles = function (element) {
        scope.$apply(function (scope) {
            console.log('files:', element.files);

            // Turn the FileList object into an Array
            scope.files = []
            for (var i = 0; i < element.files.length; i++) {
                scope.files.push(element.files[i])
            }
            scope.progressVisible = false
        });
    };

    scope.uploadFile = function () {
        var fd = new FormData()
        for (var i in scope.files) {
            fd.append("uploadedFile", scope.files[i]);
            rootScope.uploadedFileName = scope.files[i].name;
        }
        var xhr = new XMLHttpRequest()
        xhr.upload.addEventListener("progress", uploadProgress, false)
        xhr.addEventListener("load", uploadComplete, false)
        xhr.addEventListener("error", uploadFailed, false)
        xhr.addEventListener("abort", uploadCanceled, false)
        xhr.open("POST", "../../../upload/uploader.php")
        scope.progressVisible = true
        xhr.send(fd)
    }

    function uploadProgress(evt) {
        scope.$apply(function () {
            if (evt.lengthComputable) {
                scope.progress = Math.round(evt.loaded * 100 / evt.total)
            } else {
                scope.progress = 'unable to compute'
            }
        })
    }

    function uploadComplete(evt) {
        /* This event is raised when the server send back a response */
        rootScope.uploadedfileContent = evt.target.responseText;
        rootScope.forceViewCsv = true;
        document.getElementById('aViewCsv').click();
    }

    function uploadFailed(evt) {
        alert("There was an error attempting to upload the file.")
    }

    function uploadCanceled(evt) {
        scope.$apply(function () {
            scope.progressVisible = false
        })
        alert("The upload has been canceled by the user or the browser dropped the connection.")
    }
}