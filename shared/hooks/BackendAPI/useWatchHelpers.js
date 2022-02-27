//TODO verify if the app based correctly for not complete request
// chunk 1
// {"type":"DELETED","object":{"kind":"Secret","apiVersion":"v1","metadata":{"name":"serverless-build-token-mrbbb","namespace":"atm","uid":"a801b192-9e98-423e-ad6c-2f32f9202ce5","resourceVersion":"358752","creationTimestamp":"2022-02-27T13:25:44Z","annotations":{"kubernetes.io/service-account.name":"serverless-build","kubernetes.io/service-account.uid":"8d8cc123-a761-4817-92f4-70d3ce27f181"},"managedFields":[{"manager":"kube-controller-manager","operation":"Update","apiVersion":"v1","time":"2022-02-27T13:25:44Z","fieldsType":"FieldsV1","fieldsV1":{"f:data":{".":{},"f:ca.crt":{},"f:namespace":{},"f:token":{}},"f:metadata":{"f:annotations":{".":{},"f:kubernetes.io/service-account.name":{},"f:kubernetes.io/service-account.uid":{}}},"f:type":{}}}]},"data":{"ca.crt":"LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUM5akNDQWQ2Z0F3SUJBZ0lRTlpWYlkxTmRTcWtTQVh0a0tudjVsakFOQmdrcWhraUc5dzBCQVFzRkFEQVYKTVJNd0VRWURWUVFERXdwcmRXSmxjbTVsZEdWek1CNFhEVEl5TURJeU5URXdNall5TUZvWERUTXlNREl5TlRFdwpNall5TUZvd0ZURVRNQkVHQTFVRUF4TUthM1ZpWlhKdVpYUmxjekNDQVNJd0RRWUpLb1pJaHZjTkFRRUJCUUFECmdnRVBBRENDQVFvQ2dnRUJBSko5TE9wd3gwT0pYMi9id01EODZ1Q0k0VkNNdVFCVVZTTGZjOFJnTWxNYjBpMTYKdWFvenFETzBTMnVCZUU0OW56WlFER2c2MGkzNTFXRkhMS0Q5dElzUzk4UjJEY2dWY3VwaDNhV0NsWWJWY1lnWApRcE8xdWhUZmc3L0ZpcWJyUDRZNXdXWStuT2dwWjdCbHNiVGJyMEtybzc1SzY3Q3drU3ZxemhZd1M0Uks0V0tHCkw1d3hwWHpWeEVYTkZsVS8zTkszT0RyTlMzTXlkTWJFQVZEcjdXaFpSd3RqMW1LQXdFaFFDbDNCUWM2YXpCYUoKdzRvTlNRaGpsdHNDSHRMS2hsdkMxUVZyQllGWjlaMnl6YlMrcHVleDdIQzlIVjczcUhjOHRMUnhObEo0NFlBZAp0Tlc4dy84R0NWWS9iSmEwNzE2czIwNmVYRjFxeGRpcmRLVVdWQWtDQXdFQUFhTkNNRUF3RGdZRFZSMFBBUUgvCkJBUURBZ0dtTUE4R0ExVWRFd0VCL3dRRk1BTUJBZjh3SFFZRFZSME9CQllFRkRKK2lMMjBQYjR6enZJdHc2U1gKMFdPWm0ya3VNQTBHQ1NxR1NJYjNEUUVCQ3dVQUE0SUJBUUI3L3h0OS9DWjMwbzFhNVRmYnJLRHFkQTQva2NyVQpUcUxXR1FTZ0x0SHNmTkw3MFl5Y045OU8yNUhIWENqYVRVYTN6U21VYXpNNWlpbEt4Y1RUdWlLTzVKdlNBN09zCmhacWs3YnFMK2xrL0lzL0VnY3kwenBjK2JMUnFvN2FUZHl3RUUzQ0duMHhycG43cEwzZnFlY3drQUlJNVFQMSsKZ1lnU2xWaXVJQzd6c1hqZ3VGM1dpbVA4TEFJL0JrUURIdzAyc3JpSEFhVE5IRjhJS0hHeXk1cGJ6U3hXMzFlSwpCTGJ3S3J0VjZteWZEZE5zbkpyaXVZS1hqNW9WcnhSamhyZEs4VUFYNi9ucTlSWXFjZ0VueThnWWlGNnlhbE9HCkJ3TitDVnd1UFpxa24wc0pCV0lEbXJGQzR2aTY1TWh3d1lpUlAwYkVsVERWRVlqRHBWRWRTZE5xCi0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0K","namespace":"YXRt","token":"ZXlKaGJHY2lPaUpTVXpJMU5pSXNJbXRwWkNJNkluSlllR05MTFU5b1RYbGxSalJMWlV3M1pFMW5ia3hIUWpObFVtZGlWVXR5TmxsMk9GcEJRVTUyTkZFaWZRLmV5SnBjM01pT2lKcmRXSmxjbTVsZEdWekwzTmxjblpwWTJWaFkyTnZkVzUwSWl3aWEzVmlaWEp1WlhSbGN5NXBieTl6WlhKMmFXTmxZV05qYjNWdWRDOXVZVzFsYzNCaFkyVWlPaUpoZEcwaUxDSnJkV0psY201bGRHVnpMbWx2TDNObGNuWnBZMlZoWTJOdmRXNTBMM05sWTNKbGRDNXVZVzFsSWpvaWMyVnlkbVZ5YkdWemN5MWlkV2xzWkMxMGIydGxiaTF0Y21KaVlpSXNJbXQxWW1WeWJtVjBaWE11YVc4dmMyVnlkbWxqWldGalkyOTFiblF2YzJWeWRtbGpaUzFoWTJOdmRXNTBMbTVoYldVaU9pSnpaWEoyWlhKc1pYTnpMV0oxYVd4a0lpd2lhM1ZpWlhKdVpYUmxjeTVwYnk5elpYSjJhV05sWVdOamIzVnVkQzl6WlhKMmFXTmxMV0ZqWTI5MWJuUXVkV2xrSWpvaU9HUTRZMk14TWpNdFlUYzJNUzAwT0RFM0xUa3laalF0TnpCa00yTmxNamRtTVRneElpd2ljM1ZpSWpvaWMzbHpkR1Z0T25ObGNuWnBZMlZoWTJOdmRXNTBPbUYwYlRwelpYSjJaWEpzWlhOekxXSjFhV3hrSW4wLmpaTzVEVkV0djhOMVdfYWFXSlNOeUhqQjZzRkRwUlRObnlPMnhBd0JUcDVYM2JrRlh0ZkhOMmpMcW01VjRxWkFVZWFvVktlaWZWZXdFZDJxSEFRVWtFX1U2cklWRWFneDVVel9JY0l6dmRTcUt5TElSbUJhYUpiUHdjcmp6Z014WGdDZkQ2ZEF5TWR1Tk11eFV3THN0T3JEVVVhbEM2aUtlSEJRWWwwMkdRaTNvWjRPWmhQdUpZQWlsU1lEUjZiR1VVTVhwakRBbjd5VjN2MHhwUTJmRldBbGdGNGVwTlF6UGpzaHZaN0RTcTNFWnpxdk92UUhnNktFRXROYU9oaERTZzduWGNEZkxTWThsdDVoVWR1M1p6dk14MFFOd1VnVGhYdTlPWFNJcTE2UmNRMlhzdF90bzRhRE0wN1hhUkI0cDZNOHV6bk9pMDN0azVGV0ZXN0VwRFNoM2pzYWk5WTFGLWVUaHFQWUxYZ1VuQzBqUzNQVUdaeGJwcEE3OF91UDNnVE41YUNCeVB5N
// chunk 2
//   0RFR0hGa1Jpd0dCUkxZclUxV016VmlpbjVacG0tV0loeXpLZHRSWkppb05iaVg1ekpkQVA5eWR5cm9nNm01VVlRN3ZKVy0yMDZpZy1yN1dHTFpSQTlKN1MtVnFJQ2N0MGM2cWNKS2xXTm9JLWtGRFM2NXpjSXZnS2wzOTBtc2hmOWZRMW5FVldhV0l4WlJreEdIM3hCOGVNTHFyUDlxS3FCYnY0dmVxd1hqQ2pUVlZRTEZGclFBWmUxMG50YVRxemxraFg2d19nT2JKR3Y2NmJhbTZ6UVhYZUFldlQyOW9XUTNIQzFQTTRZWmxqRjNNY3dDYzVqMEdEQ2t6b1hvYkZfODFwTXdRMjVFempJQUVjQTREUEVyblVsTnhfU19Z"},"type":"kubernetes.io/service-account-token"}}

// const removeLineBreaks = str => str.replace(/(\r\n|\n|\r)/gm, '');

export const getFullLine = (updates, upIdx, incompleteLineRef) => {
  //TODO validation of a line end based on '}}' might not be enough sophisticated
  if (
    // received full
    updates[upIdx] &&
    updates[upIdx].startsWith('{"type":') &&
    updates[upIdx].endsWith('}}')
  ) {
    return updates[upIdx];
  } else if (
    // received just the line beginning
    updates[upIdx] &&
    updates[upIdx].startsWith('{"type":') &&
    !updates[upIdx].endsWith('}}')
  ) {
    // incompleteLineRef.current = removeLineBreaks(updates[upIdx]);
    incompleteLineRef.current = updates[upIdx];
    return null;
  } else if (
    // received just the line middle
    updates[upIdx] &&
    !updates[upIdx].startsWith('{"type":') &&
    !updates[upIdx].endsWith('}}')
  ) {
    incompleteLineRef.current += updates[upIdx];
    // incompleteLineRef.current += removeLineBreaks(updates[upIdx]);
    return null;
  } else if (
    // received just the line ending
    updates[upIdx] &&
    updates[upIdx].endsWith('}}')
  ) {
    // const line = incompleteLineRef.current + removeLineBreaks(updates[upIdx]);
    const line = incompleteLineRef.current + updates[upIdx];
    incompleteLineRef.current = null;
    return line;
  }
  return null;
};

export const applyUpdate = (list, setList, updateJSON) => {
  const update = JSON.parse(updateJSON);
  let idx = null;
  let newData = {};
  switch (update.type) {
    case 'MODIFIED':
      idx = list.findIndex(el => {
        return el.metadata.name === update.object.metadata.name;
      });
      if (idx === -1) break;
      newData = [...list];
      newData.splice(idx, 1, update.object);
      setList(newData);
      break;
    case 'ADDED':
      //TODO add the resource in alpabethical order
      newData = [...list];
      newData.push(update.object);
      setList(newData);
      break;
    case 'DELETED':
      idx = list.findIndex(el => {
        return el.metadata.name === update.object.metadata.name;
      });
      if (idx === -1) break;
      newData = [...list];
      newData.splice(idx, 1);
      setList(newData);
      break;
    default:
      break;
  }
};
