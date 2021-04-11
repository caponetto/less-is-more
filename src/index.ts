import {setFailed} from '@actions/core'
import {run} from './app'

run().catch(e => setFailed(e.message))
