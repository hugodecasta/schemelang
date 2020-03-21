const test = require('ava')

const SchemeLang = require('./index.js')
let schemelang = new SchemeLang()

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

test('specific scheme env', t => {
    let sc1 = new SchemeLang({'a':3})
    let sc2 = new SchemeLang({'a':5})
    let sc3 = new SchemeLang()

    t.is(sc1.interpret("a"), 3)
    t.is(sc2.interpret("a"), 5)
    t.is(sc3.interpret("(define a 7)"), 7)
    t.is(sc3.interpret("a"), 7)
})

test('and', t => {
    t.is(scheme('(and #t #t #f)'),false)
    t.is(scheme('(and #f #t #t)'),false)
    t.is(scheme('(and #t #t #t)'),true)
    t.is(scheme('(and #t #t 5)'),5)
    t.is(scheme('(and 5 #t 7)'),7)
    t.is(scheme('(and 5 #f 7)'),false)
    t.deepEqual(scheme("(and 5 #t '(a b))"),['list','a','b'])
})

test('or', t => {
    t.is(scheme('(or #f #f #t)'),true)
    t.is(scheme('(or #f #t #f)'),true)
    t.is(scheme('(or #f 7 #f)'),7)
    t.is(scheme('(or 5 7 #f)'),5)
    t.is(scheme('(or #f #f #f)'),false)
    t.deepEqual(scheme("(or '(a b) #f #f)"),['list','a','b'])
})

test('string', t => {
    t.is(scheme('"hello world"'),'hello world')
    t.is(scheme('(define a "holo")'),'holo')
    t.is(scheme('a'),'holo')
    scheme('(define a (lambda (a) (if (> a 5) "is bigger" "is less")))')
    t.is(scheme('(a 10)'),'is bigger')
    t.is(scheme('(a 2)'),'is less')
})