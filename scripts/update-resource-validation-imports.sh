#!/bin/bash

datreeRuleSource="https://raw.githubusercontent.com/datreeio/datree/main/pkg/defaultRules/defaultRules.yaml"

datreeRuleDir="resources/resource-validation/configs/datree"
datreeRuleFile="$datreeRuleDir/rules.yaml"

mkdir -p "$datreeRuleDir"

echo """
# This file contains parts from the project datreeio https://github.com/datreeio/datree/blob/main/pkg/defaultRules/defaultRules.yaml available under Appache License 2.0
# Copyright (c)  Original author(s) @ https://github.com/datreeio/datree Licensed to the Apache Software Foundation (ASF) under one or more contributor license agreements. See the NOTICE file distributed with this work for additional information regarding copyright ownership. The ASF licenses this file to you under the Apache License, Version 2.0 (the \"License\"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an \"AS IS\" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.  Modifications Copyright (c) 2022 SAP SE or an SAP affiliate company. All rights reserved.
""" > "$datreeRuleFile"
curl "$datreeRuleSource" | sed '/# yaml-language-server:/d' >> "$datreeRuleFile"
