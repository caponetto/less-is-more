import {setFailed} from '@actions/core'
import {run} from './app'
import {resolveArgs} from './inputs'

resolveArgs()
  .then(args => run(args))
  .catch(e => setFailed(e.message))
