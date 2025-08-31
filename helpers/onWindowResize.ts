function onWindowResize(camera: any, renderer: any) {
    
    // console.log("On window resize called");

    const updateWindow = (()=>{
        // console.log("Update window called");
        camera.aspect = window.innerWidth / window.innerHeight;
        //@ts-ignore
        camera.updateProjectionMatrix();
        
        renderer.setSize( window.innerWidth, window.innerHeight );
    })
    
    window.addEventListener( 'resize', updateWindow, false );
}

export default onWindowResize;
