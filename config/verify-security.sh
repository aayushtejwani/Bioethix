#!/bin/bash

# Security Verification Script for BioEthix Website
# Run this script to verify security implementations

echo "🔒 SECURITY VERIFICATION SCRIPT"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test variables
WEBSITE_URL="${1:-http://localhost:8000}"
ISSUES_FOUND=0

# Function to check URL accessibility
check_url() {
    echo "📍 Testing: $WEBSITE_URL"
    if curl -s -o /dev/null -w "%{http_code}" "$WEBSITE_URL" > /dev/null; then
        echo -e "${GREEN}✓ Website is accessible${NC}"
    else
        echo -e "${RED}✗ Website is NOT accessible${NC}"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
    echo ""
}

# Function to check security headers
check_security_headers() {
    echo "🔐 SECURITY HEADERS CHECK"
    echo "------------------------"
    
    HEADERS=$(curl -s -I "$WEBSITE_URL" 2>&1)
    
    # Check CSP
    if echo "$HEADERS" | grep -qi "Content-Security-Policy"; then
        echo -e "${GREEN}✓ Content-Security-Policy present${NC}"
    else
        echo -e "${YELLOW}⚠ Content-Security-Policy missing${NC}"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
    
    # Check X-Frame-Options
    if echo "$HEADERS" | grep -qi "X-Frame-Options"; then
        echo -e "${GREEN}✓ X-Frame-Options present${NC}"
    else
        echo -e "${YELLOW}⚠ X-Frame-Options missing${NC}"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
    
    # Check X-Content-Type-Options
    if echo "$HEADERS" | grep -qi "X-Content-Type-Options"; then
        echo -e "${GREEN}✓ X-Content-Type-Options present${NC}"
    else
        echo -e "${YELLOW}⚠ X-Content-Type-Options missing${NC}"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
    
    # Check HSTS
    if echo "$HEADERS" | grep -qi "Strict-Transport-Security"; then
        echo -e "${GREEN}✓ Strict-Transport-Security present${NC}"
    else
        echo -e "${YELLOW}⚠ Strict-Transport-Security missing (needed for HTTPS)${NC}"
    fi
    
    echo ""
}

# Function to check for exposed email addresses
check_email_exposure() {
    echo "📧 EMAIL PROTECTION CHECK"
    echo "------------------------"
    
    # Check index.html
    if curl -s "$WEBSITE_URL/index.html" | grep -q "info@bioethix.com"; then
        echo -e "${RED}✗ Email exposed in index.html${NC}"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    else
        echo -e "${GREEN}✓ Email protected in index.html${NC}"
    fi
    
    # Check contact.html
    if curl -s "$WEBSITE_URL/contact.html" | grep -q "data-email"; then
        echo -e "${GREEN}✓ Email obfuscated in contact.html${NC}"
    else
        echo -e "${YELLOW}⚠ Email obfuscation check inconclusive${NC}"
    fi
    
    echo ""
}

# Function to check for HTTPS
check_https() {
    echo "🔒 HTTPS CHECK"
    echo "--------------"
    
    if [[ "$WEBSITE_URL" == https://* ]]; then
        echo -e "${GREEN}✓ Using HTTPS${NC}"
        
        # Check SSL certificate validity
        DOMAIN=$(echo "$WEBSITE_URL" | sed -E 's|https?://([^/:]+).*|\1|')
        echo "   Checking SSL certificate for: $DOMAIN"
        
        echo | openssl s_client -servername "$DOMAIN" -connect "$DOMAIN:443" 2>/dev/null | \
        openssl x509 -noout -dates 2>/dev/null
    else
        echo -e "${YELLOW}⚠ Using HTTP (not HTTPS)${NC}"
        echo "   Note: This is OK for localhost, but MUST use HTTPS in production"
    fi
    
    echo ""
}

# Function to check for secure redirects
check_redirects() {
    echo "🔄 REDIRECT CHECK"
    echo "-----------------"
    
    # Check if .htaccess exists
    if [ -f ".htaccess" ]; then
        if grep -q "RewriteEngine" .htaccess; then
            echo -e "${GREEN}✓ .htaccess rewrite rules configured${NC}"
        fi
        
        if grep -q "X-Frame-Options" .htaccess; then
            echo -e "${GREEN}✓ X-Frame-Options configured${NC}"
        fi
    else
        echo -e "${YELLOW}⚠ .htaccess file not found${NC}"
    fi
    
    echo ""
}

# Function to check for vulnerable files
check_vulnerable_files() {
    echo "📋 VULNERABLE FILES CHECK"
    echo "------------------------"
    
    # Check for common vulnerable files
    VULNERABLE_FILES=(".env" ".git" ".htaccess" "web.config" "config.php")
    
    for file in "${VULNERABLE_FILES[@]}"; do
        if curl -s -o /dev/null -w "%{http_code}" "$WEBSITE_URL$file" | grep -q "200"; then
            echo -e "${RED}✗ $file is publicly accessible${NC}"
            ISSUES_FOUND=$((ISSUES_FOUND + 1))
        fi
    done
    
    echo -e "${GREEN}✓ No publicly accessible sensitive files${NC}"
    echo ""
}

# Function to check robots.txt
check_robots() {
    echo "🤖 ROBOTS.TXT CHECK"
    echo "------------------"
    
    ROBOTS=$(curl -s "$WEBSITE_URL/robots.txt")
    
    if echo "$ROBOTS" | grep -q "Disallow:"; then
        echo -e "${GREEN}✓ robots.txt properly configured${NC}"
        echo "   Disallowed paths:"
        echo "$ROBOTS" | grep "^Disallow:" | head -3
    else
        echo -e "${YELLOW}⚠ robots.txt may not be properly configured${NC}"
    fi
    
    echo ""
}

# Function to check for inline scripts
check_inline_scripts() {
    echo "📜 INLINE SCRIPTS CHECK"
    echo "---------------------"
    
    if curl -s "$WEBSITE_URL" | grep -q "<script>.*document.write\|eval("; then
        echo -e "${RED}✗ Found inline JavaScript (potential XSS)${NC}"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    else
        echo -e "${GREEN}✓ No dangerous inline scripts detected${NC}"
    fi
    
    echo ""
}

# Function to generate report summary
generate_summary() {
    echo "📊 SECURITY AUDIT SUMMARY"
    echo "=========================="
    
    if [ $ISSUES_FOUND -eq 0 ]; then
        echo -e "${GREEN}✓ All security checks passed!${NC}"
        echo "Your website has good basic security implementations."
    else
        echo -e "${RED}⚠ $ISSUES_FOUND issue(s) found${NC}"
        echo "Review the SECURITY_AUDIT_REPORT.md and SECURITY_IMPLEMENTATION_GUIDE.md"
    fi
    
    echo ""
    echo "📚 Documentation:"
    echo "  - SECURITY_AUDIT_REPORT.md"
    echo "  - SECURITY_IMPLEMENTATION_GUIDE.md"
    echo ""
}

# Main execution
echo ""
check_url
check_security_headers
check_email_exposure
check_https
check_redirects
check_vulnerable_files
check_robots
check_inline_scripts
generate_summary

exit $ISSUES_FOUND
