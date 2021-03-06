// Export AssemblyScript-side glue code or not everything will work (for example the customElements API).
export * from '../node_modules/asdom/assembly/glue'

import { document } from '../node_modules/asdom/assembly'
import { setTimeout } from '../node_modules/ecmassembly/assembly/index'
import './elements/NavBar'
import './elements/TheFooter'

let loader = document.querySelector('.heart-loader-container')!

setTimeout(() => {
    loader.setAttribute('class', loader.getAttribute('class') + ' fadeout')

    setTimeout(() => {
        loader.remove()
    }, 1000)
}, 1000)
