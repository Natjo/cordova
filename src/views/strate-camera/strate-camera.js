

(function () {
    function strate_camera(el) {
        const btn_camera = document.getElementById('btn-camera');
        const btn_photolib = document.getElementById('btn-photolib');
       
        const btn_videolib = document.getElementById('btn-videolib');

        btn_camera.ontouchstart = () => btn_camera.classList.add("touchStart");
        btn_photolib.ontouchstart = () => btn_photolib.classList.add("touchStart");

        btn_videolib.ontouchstart = () => btn_videolib.classList.add("touchStart");

        btn_camera.ontouchend = () => btn_camera.classList.remove("touchStart");
        btn_photolib.ontouchend = () => btn_photolib.classList.remove("touchStart");
       
        btn_videolib.ontouchend = () => btn_videolib.classList.remove("touchStart");

        btn_camera.onclick = () => exampleOneClicked(btn_camera.nextElementSibling);
        btn_photolib.onclick = () => exampleTwoClicked(btn_photolib.nextElementSibling);
       
        btn_videolib.onclick = () => exampleFourClicked(btn_videolib.nextElementSibling);

        function exampleOneClicked(img) {
            /* Front Camera , disable save to phone ,
                data url , quality 60 . */

            let pictureOptions = {
                cameraDirection: Camera.Direction.FRONT,
                saveToPhotoAlbum: false,
                destinationType: Camera.DestinationType.DATA_URL,
                quality: 60
            };

            function fctSuccess(image) {
                img.src = `data:image/jpeg;base64,${image}`;
            }

            function fctFailure(errorMsg) {
                console.log(errorMsg);
            }

            navigator
                .camera
                .getPicture(fctSuccess,
                    fctFailure,
                    pictureOptions);

        }

        function exampleTwoClicked(img) {
            /* Photo Library , allow Edit */

            let pictureOptions = {
                sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                allowEdit: true
            };

            function fctSuccess(image) {
                img.src = image;
            }

            function fctFailure(errorMsg) {
                console.log(errorMsg);
            }

            navigator
                .camera
                .getPicture(fctSuccess,
                    fctFailure,
                    pictureOptions);
        }

        function exampleThreeClicked(img) {
            /* Photo Library , popover  */
            let pictureOptions = {
                sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                popoverOptions: new CameraPopoverOptions(
                    0,
                    200,
                    300,
                    400,
                    Camera.PopoverArrowDirection.ARROW_UP,
                    0,
                    0)
            };

            function fctSuccess(image) {
                img.src = image;
            }

            function fctFailure(errorMsg) {
                console.log(errorMsg);
            }

            navigator
                .camera
                .getPicture(fctSuccess,
                    fctFailure,
                    pictureOptions);

            function updatePopOverLocation() {
                let cameraPopoverHandle = new CameraPopoverHandle();
                let cameraPopoverOptions = new CameraPopoverOptions(
                    100,
                    300,
                    300,
                    600,
                    Camera.PopoverArrowDirection.ARROW_DOWN,
                    0,
                    0);
                cameraPopoverHandle.setPosition(cameraPopoverOptions);
            }

            window.setTimeout(updatePopOverLocation, 4000);
        }

        function exampleFourClicked(vdo) {
            /* video ,  Photo Library */
            let pictureOptions = {
                mediaType: Camera.MediaType.VIDEO,
                sourceType: Camera.PictureSourceType.PHOTOLIBRARY
            };

            function fctSuccess(video) {
                vdo.src = video;
            }

            function fctFailure(errorMsg) {
                console.log(errorMsg);
            }

            navigator
                .camera
                .getPicture(fctSuccess,
                    fctFailure,
                    pictureOptions);

        }

        this.start = () => {
        }
    }

    window.strate_camera = strate_camera;
})();