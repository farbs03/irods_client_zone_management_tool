import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import PropTypes from 'prop-types'
import { useEnvironment, useServer } from '.'
import { defaultChecks } from '../data/checkfiles/default_checkfiles'
import { customChecks } from '../data/checkfiles/custom_checkfiles'

export const CheckContext = createContext({})

export const CheckProvider = ({ children }) => {
    const [isChecking, setIsChecking] = useState(false)
    const checks = [...defaultChecks, ...customChecks]
    const [inactiveChecks, setInactiveChecks] = useState(localStorage.getItem('zmt-inactiveChecks') ? new Set(JSON.parse(localStorage.getItem('zmt-inactiveChecks'))) : new Set(checks.filter(check => !check.active).map((check, index) => `zmt-${index}`)))
    const [checkObject, setCheckObject] = useState({})
    const [checkResults, setCheckResults] = useState({})
    const [checkIntervals, setCheckIntervals] = useState(localStorage.getItem('zmt-checkIntervals') ? JSON.parse(localStorage.getItem('zmt-checkIntervals')) : {})
    const [checkTimers, setCheckTimers] = useState({})
    const [statusResult, setStatusResult] = useState({})
    const { zoneContext, rescAll, serverVersions, irodsVersionComparator, isLoadingZoneContext, validServerHosts } = useServer()
    const { restApiLocation, restApiTimeout } = useEnvironment()
    let context = { rescAll, restApiLocation, restApiTimeout, validServerHosts, zoneContext }
    const callBackFn = useRef(null)
    const [timeStamp, setTimeStamp] = useState()

    useEffect(() => {
        if (localStorage.getItem('zmt-token') && Object.keys(statusResult).length === 0 && zoneContext.length > 0 && !isChecking && !isLoadingZoneContext) {
            // run checks only when data loading is complete
            runAllCheck()
        }
    }, [zoneContext, rescAll, isLoadingZoneContext])

    const checkServerVersion = (check) => {
        if ('min_server_version' in check && 'max_server_version' in check) {
            if (irodsVersionComparator(check['min_server_version'], serverVersions[0]) > 0) return serverVersions[0]
            if (irodsVersionComparator(check['max_server_version'], serverVersions[serverVersions.length - 1])) return serverVersions[serverVersions.length - 1]
            return true
        }
    }

    const removePrevStatus = (check) => {
        let prevStatus = checkResults[check['id']][1]['status']
        setStatusResult(prev => {
            prev[prevStatus] -= 1
            prev['inactive'] += 1
            return prev
        })
        setCheckResults(prev => {
            prev[check['id']] = [check, { status: 'inactive', message: 'N/A', timestamp: 'N/A' }]
            return prev
        })
        setTimeStamp(new Date())
    }

    const runOneCheck = async (check) => {
        let prevStatus = checkResults[check.id][1]['status'], timerID, result = {};
        try {
            if (checkTimers[check.id]) {
                // reset timer if needed
                clearTimeout(checkTimers[check.id])
            }
            // run check if server requirements are met
            if (checkServerVersion(check) === true) {
                result = await check.checker.apply(context)
                result.timestamp = new Date()
            } else {
                result = { status: 'unavailable', message: `This check is unavailable because the iRODS Server version (${checkServerVersion(check)}) is out of range (${check.min_server_version} - ${check.max_server_version}).`, timestamp: new Date() }
            }
        } catch (e) {
            console.log(e)
            result = { status: 'error', message: 'Error when running the check.', timestamp: new Date() }
        }
        finally {
            setCheckResults((prev) => {
                prev[check.id] = [check, result]
                return prev
            })
            setStatusResult((prev) => {
                prev[prevStatus] -= 1
                prev[result.status] += 1
                return prev
            })
            timerID = setTimeout(() => runOneCheck(check), 1000 * checkIntervals[check['id']])
            setCheckTimers((prev) => {
                prev[check.id] = timerID
                return prev
            })
            setTimeStamp(new Date())
        }
    }

    const runAllCheck = () => {
        // before running all checks, reset all timers
        for (let key in checkTimers) {
            clearTimeout(checkTimers[key])
        }
        setIsChecking(true)
        let newCheckResults = {}
        let newStatusResult = { 'error': 0, 'warning': 0, 'healthy': 0, 'inactive': 0, 'unavailable': 0 }
        let newCheckObject = {}
        let newCheckTimers = {}
        let newCheckIntervals = {}
        // iterate through all checks
        checks.forEach((check, index) => {
            (async function () {
                check.id = `zmt-${index}`
                newCheckObject[check['id']] = check
                newCheckIntervals[check['id']] = check.id in checkIntervals ? checkIntervals[check.id] : ('interval_in_seconds' in check ? check['interval_in_seconds'] : 300)
                // if active, run the check
                if (!inactiveChecks.has(`zmt-${index}`)) {
                    try {
                        // enforce minimum/maximum server version
                        if (checkServerVersion(check) === true) {
                            let value = await check.checker.apply(context)
                            value.timestamp = new Date()
                            let id = setTimeout(() => callBackFn.current(check), 1000 * newCheckIntervals[check['id']])
                            newCheckTimers[check['id']] = id
                            newCheckResults[check['id']] = [check, value]
                            newStatusResult[value.status]++
                        } else {
                            newStatusResult['unavailable']++
                            newCheckResults[check['id']] = [check, { status: 'unavailable', message: `This check is unavailable because the iRODS Server version (${checkServerVersion(check)}) is out of range (${check.min_server_version} - ${check.max_server_version}).`, timestamp: new Date() }]
                        }
                        // catch error if check function is not working correctly
                    } catch (e) {
                        console.log(e)
                        newStatusResult['error']++
                        newCheckResults[check['id']] = [check, { status: 'error', timestamp: new Date() }]
                    }
                } else {
                    newCheckResults[check['id']] = [check, { status: 'inactive', timestamp: 'N/A' }]
                    newStatusResult['inactive']++
                }
                if (Object.keys(newCheckResults).length === checks.length) {
                    setCheckResults(newCheckResults)
                    setStatusResult(newStatusResult)
                    setCheckObject(newCheckObject)
                    setCheckTimers(newCheckTimers)
                    setCheckIntervals(newCheckIntervals)
                    setIsChecking(false)
                    setTimeStamp(new Date())
                }
            })()
        })
    }

    const modifyCheckInterval = (id, newInterval) => {
        // update intervals, run check again and reset timer
        setCheckIntervals((prev) => {
            prev[id] = Number(newInterval)
            localStorage.setItem('zmt-checkIntervals', JSON.stringify(prev))
            return prev
        })
        runOneCheck(checkObject[id])
    }

    const modifyCheckActivity = (id) => {
        let newSet = new Set(inactiveChecks)
        if (inactiveChecks.has(id)) {
            newSet.delete(id)
            runOneCheck(checkObject[id])
        }
        else {
            // update check's status to 'inactive' and clear timeout
            clearTimeout(checkTimers[id])
            let newCheckTimers = Object.assign({}, checkTimers)
            newCheckTimers[id] = null
            setCheckTimers(newCheckTimers)
            newSet.add(id)
            removePrevStatus(checkObject[id])
        }
        setInactiveChecks(newSet)
        localStorage.setItem('zmt-inactiveChecks', JSON.stringify([...newSet]))
    }

    useEffect(() => {
        // make the callback function gets access to the latest state
        callBackFn.current = runOneCheck
    }, [timeStamp])

    return (
        <CheckContext.Provider value={{
            isChecking, checks, checkResults, checkIntervals, statusResult, checkObject, timeStamp,
            inactiveChecks, modifyCheckActivity, modifyCheckInterval,
            runOneCheck, runAllCheck
        }}>
            {children}
        </CheckContext.Provider>
    )
}

CheckProvider.propTypes = {
    children: PropTypes.node.isRequired
}

export const useCheck = () => useContext(CheckContext)