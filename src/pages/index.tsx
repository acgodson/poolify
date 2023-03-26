import React from 'react'
import Home from './home';


export default function IndexPage() {
  React.useEffect(() => {
    (window as any)?.ethereum?.on("accountsChanged", function () {
      // Time to reload your interface with accounts[0]!
      localStorage.clear();
      window.location.reload();
    });
  }, []);


  return (
    <>

      <Home />
    </>

  )
}
