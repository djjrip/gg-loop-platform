Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Create Form
$form = New-Object System.Windows.Forms.Form
$form.Text = "Empire Command - Secure Uplink"
$form.Size = New-Object System.Drawing.Size(500, 350)
$form.StartPosition = "CenterScreen"
$form.BackColor = [System.Drawing.Color]::FromArgb(10, 10, 10) # Almost Black
$form.ForeColor = [System.Drawing.Color]::FromArgb(0, 255, 0) # Hacker Green
$form.FormBorderStyle = [System.Windows.Forms.FormBorderStyle]::FixedDialog
$form.MaximizeBox = $false

# Header
$lblHeader = New-Object System.Windows.Forms.Label
$lblHeader.Location = New-Object System.Drawing.Point(20, 20)
$lblHeader.Size = New-Object System.Drawing.Size(460, 30)
$lblHeader.Text = "SECURE CREDENTIAL UPLINK"
$lblHeader.Font = New-Object System.Drawing.Font("Consolas", 14, [System.Drawing.FontStyle]::Bold)
$form.Controls.Add($lblHeader)

# DB Label and Input
$lbl1 = New-Object System.Windows.Forms.Label
$lbl1.Location = New-Object System.Drawing.Point(20, 70)
$lbl1.Size = New-Object System.Drawing.Size(460, 20)
$lbl1.Text = "DATABASE_URL (MUST BE PUBLIC - FROM 'CONNECT' TAB):"
$lbl1.ForeColor = [System.Drawing.Color]::Yellow
$lbl1.ForeColor = [System.Drawing.Color]::Yellow
$lbl1.Font = New-Object System.Drawing.Font("Consolas", 10)
$form.Controls.Add($lbl1)

$txt1 = New-Object System.Windows.Forms.TextBox
$txt1.Location = New-Object System.Drawing.Point(20, 95)
$txt1.Size = New-Object System.Drawing.Size(440, 25)
$txt1.BackColor = [System.Drawing.Color]::FromArgb(30, 30, 30)
$txt1.ForeColor = [System.Drawing.Color]::White
$txt1.Font = New-Object System.Drawing.Font("Consolas", 10)
$form.Controls.Add($txt1)

# SES Label and Input
$lbl2 = New-Object System.Windows.Forms.Label
$lbl2.Location = New-Object System.Drawing.Point(20, 135)
$lbl2.Size = New-Object System.Drawing.Size(460, 20)
$lbl2.Text = "SES_VERIFIED_EMAIL (From AWS):"
$lbl2.Font = New-Object System.Drawing.Font("Consolas", 10)
$form.Controls.Add($lbl2)

$txt2 = New-Object System.Windows.Forms.TextBox
$txt2.Location = New-Object System.Drawing.Point(20, 160)
$txt2.Size = New-Object System.Drawing.Size(440, 25)
$txt2.BackColor = [System.Drawing.Color]::FromArgb(30, 30, 30)
$txt2.ForeColor = [System.Drawing.Color]::White
$txt2.Font = New-Object System.Drawing.Font("Consolas", 10)
$form.Controls.Add($txt2)

# Submit Button
$btn = New-Object System.Windows.Forms.Button
$btn.Location = New-Object System.Drawing.Point(125, 220)
$btn.Size = New-Object System.Drawing.Size(250, 50)
$btn.Text = "INITIALIZE UPLINK"
$btn.BackColor = [System.Drawing.Color]::FromArgb(0, 100, 0)
$btn.ForeColor = [System.Drawing.Color]::White
$btn.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$btn.Font = New-Object System.Drawing.Font("Consolas", 12, [System.Drawing.FontStyle]::Bold)
$btn.DialogResult = [System.Windows.Forms.DialogResult]::OK
$btn.Cursor = [System.Windows.Forms.Cursors]::Hand
$form.Controls.Add($btn)

$form.Add_Shown({
        $form.Activate()
        [System.Windows.Forms.MessageBox]::Show("Commander, the previous URL was INTERNAL.`n`nPlease copy the PUBLIC connection string.`n`n(Railway -> Connect -> Public Networking)", "Correction Needed", [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Exclamation)
    })
$result = $form.ShowDialog()

if ($result -eq [System.Windows.Forms.DialogResult]::OK) {
    if ($txt1.Text -and $txt2.Text) {
        $envPath = ".env"
        $dbUrl = $txt1.Text.Trim()
        $sesEmail = $txt2.Text.Trim()
        
        Write-Host "Updating environment configuration..."
        
        if (Test-Path $envPath) {
            $content = Get-Content $envPath -Raw
            
            # Smart Regex Replacements
            if ($content -match "DATABASE_URL=") {
                $content = $content -replace "DATABASE_URL=.*", "DATABASE_URL=`"$dbUrl`""
            }
            else {
                $content += "`r`nDATABASE_URL=`"$dbUrl`""
            }
            
            if ($content -match "SES_VERIFIED_EMAIL=") {
                $content = $content -replace "SES_VERIFIED_EMAIL=.*", "SES_VERIFIED_EMAIL=`"$sesEmail`""
            }
            else {
                $content += "`r`nSES_VERIFIED_EMAIL=`"$sesEmail`""
            }
            
            Set-Content $envPath $content -Encoding UTF8
        }
        else {
            # Create new if missing
            $newContent = "DATABASE_URL=`"$dbUrl`"`r`nSES_VERIFIED_EMAIL=`"$sesEmail`""
            $newContent | Set-Content $envPath -Encoding UTF8
        }
        
        [System.Windows.Forms.MessageBox]::Show("Uplink Established. Keys Saved.", "Mission Accomplished", [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Information)
    }
}
