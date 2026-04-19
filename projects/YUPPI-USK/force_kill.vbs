Set UAC = CreateObject("Shell.Application")
UAC.ShellExecute "cmd.exe", "/c taskkill /F /PID 15680", "", "runas", 1
