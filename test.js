const test = require('ava')

const schemelang = require('./index.js')

const scheme = schemelang.interpret
const parser = schemelang.parse
const handle = schemelang.handle
 
test('parse', t => {
    t.deepEqual(parser('(define a 5)'), ['define','a',5])
})
test('handle', t => {
    t.deepEqual(handle(['define','l',['abslist','a','b','c']]), ['list','a','b','c'])
})
 
test('define', t => {
    scheme('(clear)')
    scheme('(define a 5)')
    t.is(scheme('a'), 5)
})

test('action', t => {
    scheme('(clear)')
    t.is(scheme('(define a (+ 5 4))'), 9)
})

test('lambda', t => {
    scheme('(clear)')
    let meth = scheme('(define func (lambda (a b) (+ a b)))')
    t.is(typeof meth, 'function')
})

test('exec lambda', t => {
    t.is(scheme('(func 2 3)'), 5)
})

test('list car', t => {
    t.is(scheme("(car '(a b c d))"), "a")
})

test('list cdr', t => {
    t.deepEqual(scheme("(cdr '(a b c d))"), ['list','b','c','d'])
})

test('list cadr', t => {
    t.is(scheme("(cadr '(a b c d))"), 'b')
})

test('list define', t => {
    scheme('(clear)')
    t.deepEqual(scheme("(define tot '(+ a b))"), ['list','+','a','b'])
})

test('list read', t => {
    t.deepEqual(scheme("tot"), ['list','+','a','b'])
})

test('list eval', t => {
    t.is(scheme("(define a 5)"), 5)
    t.is(scheme("(define b 4)"), 4)
    t.is(scheme("(eval tot)"),9)
})

test('lambda recurs', t => {
    scheme('(define rev (lambda (l) (if (null? l) l (append (rev (cdr l)) (list (car l))))))')
    t.deepEqual(scheme("(rev '(a b c d))"), ['list','d','c','b','a'])
})

test('cons', t => {
    scheme('(clear)')
    scheme("(define l1 '(a b c d))")
    scheme("(define l2 '(1 2 3 4))")
    t.deepEqual(scheme("(cons (car l1) (cdr l2))"), ['list','a',2,3,4])
    t.deepEqual(scheme("(cons '(g h) (cdr l2))"), ['list',['list','g','h'],2,3,4])
})

test('negate', t => {
    scheme('(clear)')
    scheme("(define a #t)")
    scheme("(define b #f)")
    t.is(scheme("a"), true)
    t.is(scheme("b"), false)
    t.is(scheme("(not b)"), true)
})

test('let', t => {
    scheme('(clear)')
    scheme("(define func (lambda (n) (let ((a 5)) (- a n))))")
    t.is(scheme("(func 5)"), 0)
    t.is(scheme("(func (- 5))"), 10)
})