package utils

import (
	"fmt"
	"strings"
)

// JoinComma joins strings with a comma
func JoinComma(s []string) string {
	return strings.Join(s, ", ")
}

// MapUpdate placeholders for UPDATE queries starting from an index
func MapUpdate(cols []string, startIdx int) []string {
	res := make([]string, len(cols))
	for i, col := range cols {
		res[i] = fmt.Sprintf("%s = $%d", col, i+startIdx)
	}
	return res
}

// Placeholders returns a string containing $start, $start+1, ..., $start+count-1
func Placeholders(count int, start int) string {
	res := make([]string, count)
	for i := 0; i < count; i++ {
		res[i] = fmt.Sprintf("$%d", i+start)
	}
	return strings.Join(res, ", ")
}
