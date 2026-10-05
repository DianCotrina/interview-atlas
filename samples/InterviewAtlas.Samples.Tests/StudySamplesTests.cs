using Xunit;

namespace InterviewAtlas.Samples;

public partial class StudySamples
{
    [Fact]
    public void CountingRetainsEachFrequency()
    {
        var result = ContarEstados(new() { "OK", "WAIT", "OK", "FAIL", "OK" });
        Assert.Equal(3, result.Count);
        Assert.Equal(3, result["OK"]);
        Assert.Equal(1, result["WAIT"]);
        Assert.Equal(1, result["FAIL"]);
    }

    [Fact]
    public void EmptyCountingReturnsEmptyMap() => Assert.Empty(ContarEstados(new()));

    [Fact]
    public void GroupingRetainsAllActionsInInputOrder()
    {
        var result = AccionesPorClinico(new() { ("Ada", "scan"), ("Lin", "check"), ("Ada", "scan") });
        Assert.Equal(2, result.Count);
        Assert.Equal(new[] { "scan", "scan" }, result["Ada"]);
        Assert.Equal(new[] { "check" }, result["Lin"]);
    }

    [Fact]
    public void EmptyGroupingReturnsEmptyMap() => Assert.Empty(AccionesPorClinico(new()));

    [Fact]
    public void DuplicateIsTheEarliestSecondOccurrence()
    {
        // A appeared first, but B repeats first.
        Assert.Equal("B", PrimeroRepetido(new() { "A", "B", "B", "A" }));
    }

    [Fact]
    public void NoDuplicateReturnsNull() => Assert.Null(PrimeroRepetido(new() { "A", "B" }));

    [Fact]
    public void EmptyDuplicateReturnsNull() => Assert.Null(PrimeroRepetido(new()));

    [Theory]
    [InlineData("", "", true)]
    [InlineData("aab", "aba", true)]
    [InlineData("aab", "abb", false)]
    [InlineData("abc", "abcd", false)]
    [InlineData("abcd", "abc", false)]
    [InlineData("abc", "abd", false)]
    [InlineData("A", "a", false)]
    [InlineData("é", "é", true)]
    [InlineData("😀a", "a😀", true)]
    public void AnagramsCompareCaseSensitiveUtf16Frequencies(string a, string b, bool expected)
        => Assert.Equal(expected, SonAnagramas(a, b));
}
