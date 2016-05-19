/*
In the process of rewriting fingerprinting and pre-processing (currently in bash and python) scrips in Node.js
*/
/*
//Fingerprinting bash script based on provided subnets in subnets.txt
//Sample subnets.txt file contents
//66.231
//66.192
#!/bin/bash
subnets=$(cat './subnets.txt');
re="ebay"
for subnet in $subnets
    do
        for newip in $subnet.{1..255}
	do
	for ip in $newip.{1..255}
        do  
	    item=$(dig -x $ip | awk '/PTR[[:space:]]/{print $NF}i')
            if [[ $item == *"$re"* ]]
            then
                echo "${ip} : ${item}" >> results.txt
                curl -I -L http://$item -s -m 10 | grep 'Server\|X-Powered-By\|X-Pingback' >> results.txt
                curl -I -L https://$item -s -k -m 10 | grep 'Server\|X-Powered-By\|X-Pingback' >> results.txt
		var=$(curl -s -L http://$item -m 60  | grep wp-content | wc -l)
		if [[ $var -ge 5 ]] 
		then
		    echo "WordPress" >> results.txt
		    curl -s -L http://$item/readme.html -m 60  | grep Version | cut -d' ' -f4 >> results.txt
		fi 
		nmap -sV -T4 -F $ip --host-timeout 60 | grep open | awk '{$1=$2=""; print $0}' >> results.txt
                var=0  
	    fi
            done
	done 
done


*/
