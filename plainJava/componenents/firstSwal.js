import Swal from 'sweetalert2';

function sayHello() {
    if(location.hostname !== "localhost"){
        Swal.fire({
            title: 'Welcome to AI Flood Map generator',
            html: 'Choose <code>Start</code> to start simulation.<br> Under <code>Examples</code> are some places to start',
            footer: '<a href="https://www.hydrotec.de/starkregen-webviewer/">Searching for more accurate maps? 🤔</a>',
            imageUrl: 'https://unsplash.it/id/1053/400/200',
            confirmButtonText: "Let's go",
            showCloseButton: true,
            imageWidth: 400,
            imageHeight: 200,
            imageAlt: 'Custom image',
        });
    } 
};

export default sayHello;