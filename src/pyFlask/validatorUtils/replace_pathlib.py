# Purpose: Replace pathlib.py in anaconda3 environment with cpython's pathlib.py for python3.7
# Rationale: When tangling the validator within anaconda3, the pathlib.py module is overwritten with a backported version. It is buggy and does not work as expected.

target_file = '/home/anaconda3/envs/env-validator/lib/python3.7/pathlib.py'

# read contents from file
target_file_input = 'replace_pathlib.py'

# 



