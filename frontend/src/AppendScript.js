const AppendScript = (src) => {

    if (document.querySelector(`script[src="${src}"]`)) return;

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    document.body.appendChild(script);

}

export default AppendScript;